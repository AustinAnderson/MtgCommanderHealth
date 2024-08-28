using Microsoft.AspNetCore.Mvc;
using MtgCommanderHealth.Server.Persistence;

namespace MtgCommanderHealth.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CommanderController : ControllerBase
    {
        private readonly IGameStateRepository stateRepository;

        public CommanderController(IGameStateRepository stateRepository)
        {
            this.stateRepository = stateRepository;
        }

        [HttpGet("CommanderList")]
        public async Task<IEnumerable<CommanderWithId>> GetUsers()
        {
            return await stateRepository.GetCommanders();
        }
        [HttpPost("NewCommander/{name}")]
        public async Task<ActionResult<int>> RegisterNewCommander(string name)
        {
            return Ok(await stateRepository.AddCommander(name));
        }
        [HttpPatch("CommanderNameChange/{oldName}/{newName}")]
        public async Task<ActionResult> ChangeCommanderName(string oldName, string newName)
        {
            try
            {
                await stateRepository.RenameCommander(oldName, newName);
                return Ok();
            }
            catch(KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
