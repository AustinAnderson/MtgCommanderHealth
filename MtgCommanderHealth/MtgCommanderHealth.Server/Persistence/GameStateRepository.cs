using System.Diagnostics;
using System.Text.Json;

namespace MtgCommanderHealth.Server.Persistence
{
    public interface IGameStateRepository
    {
        Task<int> AddUser(string name);
        Task RenameUser(string oldName, string newName);
        Task<List<UserWithId>> GetUsers();

        Task<int> AddCommander(string name);
        Task RenameCommander(string oldName, string newName);
        Task<List<CommanderWithId>> GetCommanders();
        Task<Dictionary<int, CommanderSounds>> GetSoundsByCommanderId();
        Task<Guid> RegisterSound(string relPath);
        Task SetCommanderAttackSound(int commanderId, Guid soundId);
        Task SetCommanderSummonSound(int commanderId, Guid soundId);


        Task<WinRateGraph> GetWinRates();
        Task AddWin(int playerId, int commanderId);
        Task AddKill(int playerId, int commanderId, int victimId, int victimCommanderId);

    }
    public class FileGameStateRepository : IGameStateRepository
    {
        public FileGameStateRepository(ILogger<FileGameStateRepository> logger, IRootedFileProvider fileStorage)
        {
            savePath = Path.Combine(fileStorage.Root, "saveData.json");
            if (!File.Exists(savePath))
            {
                File.WriteAllText(savePath, "{}");
            }

            this.logger = logger;
            this.fileStorage = fileStorage;
        }
        private readonly string savePath;
        //could do reader-writer lock, but because it's file persist it's
        //assumed to be running locally anyway, so don't need
        private static readonly SemaphoreSlim _nameLock = new SemaphoreSlim(1);
        private static readonly SemaphoreSlim _cmdLock = new SemaphoreSlim(1);
        private static readonly SemaphoreSlim _soundLock = new SemaphoreSlim(1);
        private readonly ILogger<FileGameStateRepository> logger;
        private readonly IRootedFileProvider fileStorage;

        public class SyncedToken : IDisposable
        {
            private readonly SemaphoreSlim shared;
            private SyncedToken(SemaphoreSlim shared)
            {
                this.shared = shared;
            }
            public static async Task<SyncedToken> Get(SemaphoreSlim shared)
            {
                await shared.WaitAsync();
                return new SyncedToken(shared);
            }

            public void Dispose()
            {
                shared.Release();
            }
        }
        private async Task<GameData> GetGameData()
        {
            await using var saveFileStream = File.OpenRead(savePath);
            return await JsonSerializer.DeserializeAsync<GameData>(
                saveFileStream
            ) ?? new GameData();
        }

        private async Task SaveGameData(GameData gameData)
        {
            var update = JsonSerializer.Serialize(gameData);
            File.WriteAllText(savePath, update);
        }

        public async Task<int> AddUser(string name)
        {
            using var scopedLock = await SyncedToken.Get(_nameLock);
            var data = await GetGameData();
            data.PlayerList.Add(name);
            var id = data.PlayerList.Count - 1;
            await SaveGameData(data);
            return id;
        }

        public async Task RenameUser(string oldName, string newName)
        {
            using var scopedLock = await SyncedToken.Get(_nameLock);
            var data = await GetGameData();
            if (!data.PlayerList.TryGetPlayerId(oldName, out int id))
            {
                throw new KeyNotFoundException($"no such player '{oldName}'");
            }
            data.PlayerList[id] = newName;
            await SaveGameData(data);
        }

        public async Task<List<UserWithId>> GetUsers()
        {
            using var scopedLock = await SyncedToken.Get(_nameLock);
            return (await GetGameData()).PlayerList.Select((x, i) => new UserWithId
            {
                Id = i,
                User = x
            }).ToList();
        }

        public async Task<int> AddCommander(string name)
        {
            using var scopedLock = await SyncedToken.Get(_cmdLock);
            var data = await GetGameData();
            data.CommanderList.Add(name);
            var id = data.CommanderList.Count - 1;
            await SaveGameData(data);
            return id;
        }

        public async Task RenameCommander(string oldName, string newName)
        {
            using var scopedLock = await SyncedToken.Get(_cmdLock);
            var data = await GetGameData();
            if (!data.CommanderList.TryGetCommanderId(oldName, out int id))
            {
                throw new KeyNotFoundException($"no such commander '{oldName}'");
            }
            data.CommanderList[id] = newName;
            await SaveGameData(data);
        }

        public async Task<List<CommanderWithId>> GetCommanders()
        {
            using var scopedLock = await SyncedToken.Get(_cmdLock);
            return (await GetGameData()).CommanderList.Select((x, i) => new CommanderWithId
            {
                CommanderName = x,
                Id = i
            }).ToList();
        }
        public async Task<Dictionary<int, CommanderSounds>> GetSoundsByCommanderId()
        {
            using var scopedLock = await SyncedToken.Get(_cmdLock);
            var data = await GetGameData();
            return data.SoundsByCommanderId;
        }

        private void ValidateIdMin(string type, int id)
        {
            if(id < 0)
            {
                throw new ArgumentException($"invalid {type} '{id}', ids can't be negative");
            }
        }
        private void ValidateIdMax(string type, int id, int max)
        {
            if(id >= max)
            {
                throw new KeyNotFoundException($"no such {type} '{id}'");
            }
        }

        public async Task<WinRateGraph> GetWinRates()
        {
            using var scopedCmdLock = await SyncedToken.Get(_cmdLock);
            using var scopedNameLock = await SyncedToken.Get(_nameLock);
            return (await GetGameData()).WinRates;
        }

        public async Task AddWin(int playerId, int commanderId)
        {
            ValidateIdMin("commander id", commanderId);
            ValidateIdMin("player id", playerId);

            using var scopedCmdLock = await SyncedToken.Get(_cmdLock);
            using var scopedNameLock = await SyncedToken.Get(_nameLock);
            var data = await GetGameData();
            ValidateIdMax("player id", playerId, data.PlayerList.Count);
            ValidateIdMax("commander id", commanderId, data.CommanderList.Count);
            var combatantId = CombatantId.Pack(playerId, commanderId);
            if (data.WinRates.WinCountsByCombatant.ContainsKey(combatantId))
            {
                data.WinRates.WinCountsByCombatant[combatantId]++;
            }
            else
            {
                data.WinRates.WinCountsByCombatant[combatantId] = 1;
            }
            await SaveGameData(data);
        }

        public async Task AddKill(int playerId, int commanderId, int victimPlayerId, int victimCommanderId)
        {
            ValidateIdMin("commander id", commanderId);
            ValidateIdMin("player id", playerId);
            ValidateIdMin("killed player's commander id", victimCommanderId);
            ValidateIdMin("killed player id", victimPlayerId);

            using var scopedCmdLock = await SyncedToken.Get(_cmdLock);
            using var scopedNameLock = await SyncedToken.Get(_nameLock);
            var data = await GetGameData();
            ValidateIdMax("player id", playerId, data.PlayerList.Count);
            ValidateIdMax("commander id", commanderId, data.CommanderList.Count);
            ValidateIdMax("killed player's commander id", victimCommanderId, data.CommanderList.Count);
            ValidateIdMax("killed player id", victimPlayerId, data.PlayerList.Count);

            var attackerId = CombatantId.Pack(playerId,commanderId);
            var victimId = CombatantId.Pack(victimPlayerId,victimCommanderId);  
            if(!data.WinRates.KillCounts.TryGetValue(attackerId, out var killCounts))
            {
                killCounts = new Dictionary<long, int>();
                data.WinRates.KillCounts[attackerId] = killCounts;
            }
            //killCounts now a ref to the value in the dict
            if(killCounts.ContainsKey(victimId))
            {
                killCounts[victimId]++;
            }
            else
            {
                killCounts[victimId] = 1;
            }
            await SaveGameData(data);
        }

        public async Task<Guid> RegisterSound(string relPath)
        {
            using var scopedSoundLock = await SyncedToken.Get(_soundLock);
            var data = await GetGameData();
            var existing = data.RegisteredSounds.FirstOrDefault(kvp=>kvp.Value==relPath);
            if (!existing.Equals(default))
            {
                return existing.Key;
            }
            var key = Guid.NewGuid();
            data.RegisteredSounds.Add(key, relPath);
            await SaveGameData(data);
            return key;
        }

        public async Task SetCommanderAttackSound(int commanderId, Guid soundId)
        {
            using var scopedCmdLock = await SyncedToken.Get(_cmdLock);
            using var scopedSoundLock = await SyncedToken.Get(_soundLock);
            var data = await GetGameData();
            if(!data.SoundsByCommanderId.TryGetValue(commanderId, out var soundsByCommanderId))
            {
                soundsByCommanderId = new CommanderSounds();
                data.SoundsByCommanderId[commanderId] = soundsByCommanderId;
            }
            soundsByCommanderId.AttackSoundId = soundId;
            await SaveGameData(data);
        }

        public async Task SetCommanderSummonSound(int commanderId, Guid soundId)
        {
            using var scopedCmdLock = await SyncedToken.Get(_cmdLock);
            using var scopedSoundLock = await SyncedToken.Get(_soundLock);
            var data = await GetGameData();
            if(!data.SoundsByCommanderId.TryGetValue(commanderId, out var soundsByCommanderId))
            {
                soundsByCommanderId = new CommanderSounds();
                data.SoundsByCommanderId[commanderId] = soundsByCommanderId;
            }
            soundsByCommanderId.SummonSoundId = soundId;
            await SaveGameData(data);

        }
    }
}
