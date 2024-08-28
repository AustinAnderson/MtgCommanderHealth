using Microsoft.AspNetCore.Mvc;
using MtgCommanderHealth.Server.Persistence;

namespace MtgCommanderHealth.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IGameStateRepository stateRepository;

        public UserController(IGameStateRepository stateRepository)
        {
            this.stateRepository = stateRepository;
        }

        //usually bad to use the same model as the persistence
        //see if it comes back to bite me for such a small project
        [HttpGet("UserList")]
        public async Task<IEnumerable<UserWithId>> GetUsers()
        {
            return await stateRepository.GetUsers();
        }
        [HttpPost("NewUser/{name}")]
        public async Task<ActionResult<int>> RegisterNewUser(string name)
        {
            return Ok(await stateRepository.AddUser(name));
        }
        [HttpPatch("UserNameChange/{oldName}/{newName}")]
        public async Task<ActionResult> ChangeUserName(string oldName, string newName)
        {
            try
            {
                await stateRepository.RenameUser(oldName, newName);
                return Ok();
            }
            catch(KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
