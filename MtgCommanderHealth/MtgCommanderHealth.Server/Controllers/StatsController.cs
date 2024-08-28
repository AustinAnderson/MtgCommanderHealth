using Microsoft.AspNetCore.Mvc;
using MtgCommanderHealth.Server.Models;
using MtgCommanderHealth.Server.Persistence;

namespace MtgCommanderHealth.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StatsController : ControllerBase
    {
        private readonly IGameStateRepository stateRepository;

        public StatsController(IGameStateRepository stateRepository)
        {
            this.stateRepository = stateRepository;
        }

        [HttpGet("WinsForUser/{userId}")]
        public async Task<ActionResult<WinsList>> GetWinCount(int userId)
        {
            if(!(await stateRepository.GetUsers()).Any(x=>x.Id == userId))
            {
                return BadRequest($"no user found with id '{userId}'");
            }
            var commanders = await stateRepository.GetCommanders();
            var winRates=await stateRepository.GetWinRates();
            var wins=new WinsList();
            foreach(var commander in commanders)
            {
                if(winRates.WinCountsByCombatant.TryGetValue(CombatantId.Pack(userId,commander.Id), out var count))
                {
                    wins.WinCountsByCommanderId.Add(commander.Id, count);
                }
            }
            return Ok(wins);
        }
    }
}
