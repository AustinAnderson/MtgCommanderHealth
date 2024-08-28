namespace MtgCommanderHealth.Server.Persistence;
using CommanderId = int;
using PlayerId = int;
using T_CombatantId = long;
public static class CombatantId
{
    public static T_CombatantId Pack(PlayerId playerId, CommanderId commanderId)
        => BitConverter.ToInt64(new[] {
            BitConverter.GetBytes(playerId),
            BitConverter.GetBytes(commanderId)
        }.SelectMany(x=>x).ToArray());
    public static PlayerId GetPlayerId(this T_CombatantId combatantId)
        => BitConverter.ToInt32(BitConverter.GetBytes(combatantId).Take(4).ToArray());
    public static CommanderId GetCommanderId(this T_CombatantId combatantId)
        => BitConverter.ToInt32(BitConverter.GetBytes(combatantId).Skip(4).Take(4).ToArray());
}
public static class OrdinalIdsExt
{
    /// <summary>
    /// returns -1 if not found
    /// </summary>
    public static CommanderId GetCommanderId(this List<string> commanderList, string commanderName)
        => commanderList.IndexOf(commanderName);
    public static bool TryGetCommanderId(this List<string> commanderList, string commanderName, out CommanderId commanderId)
    {
        commanderId = commanderList.GetCommanderId(commanderName);
        return commanderId != -1;
    }
    /// <summary>
    /// returns -1 if not found
    /// </summary>
    public static PlayerId GetPlayerId(this List<string> playerList, string playerName)
        => playerList.IndexOf(playerName);
    public static bool TryGetPlayerId(this List<string> playerList, string playerName, out PlayerId playerId)
    {
        playerId = playerList.GetPlayerId(playerName);
        return playerId != -1;
    }
    /// <summary>
    /// returns -1 if not found
    /// </summary>
    public static int GetCombatantVertexId(this List<T_CombatantId> combatants, T_CombatantId id) 
        => combatants.IndexOf(id);
    public static bool TryGetCombatantVertexId(this List<T_CombatantId> combatants, T_CombatantId id, out int vertexId)
    {
        vertexId = combatants.GetCombatantVertexId(id);
        return vertexId != -1;
    }
}



public class CommanderSounds
{
    public Guid AttackSoundId { get; set; }
    public Guid SummonSoundId { get; set; }
}
public class WinRateGraph
{
    public Dictionary<T_CombatantId, int> GameCountsByCombatant = new();
    public Dictionary<T_CombatantId, int> WinCountsByCombatant = new();
    ///<summary>
    ///KillCounts[attacker][victim]=number of times
    ///</summary>
    public Dictionary<T_CombatantId, Dictionary<T_CombatantId, int>> KillCounts = new();
}
public class GameData
{
    /// <summary>
    /// dict of id to relative path
    /// </summary>
    public Dictionary<Guid, string> RegisteredSounds { get; set; } = new();
    //id by ordinal, enforce unique
    public List<string> CommanderList { get; set; } = new();
    //id by ordinal, enforce unique
    public List<string> PlayerList { get; set; } = new();
    public Dictionary<CommanderId, CommanderSounds> SoundsByCommanderId { get; set; } = new();
    public Dictionary<string, List<CommanderId>> CommanderIdsByUser {  get; set; } = new();
    public WinRateGraph WinRates = new();
}
