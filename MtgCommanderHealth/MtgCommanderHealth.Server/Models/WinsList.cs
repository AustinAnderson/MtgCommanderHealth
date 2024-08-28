namespace MtgCommanderHealth.Server.Models
{
    public class WinsList
    {
        public Dictionary<int, int> WinCountsByCommanderId { get; set; } = new();
    }
}
