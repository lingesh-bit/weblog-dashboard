using Microsoft.AspNetCore.Mvc;
using WebLogAnalytics.Services;

namespace WebLogAnalytics.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _analyticsService;

    public AnalyticsController(AnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("daily-traffic")]
    public async Task<IActionResult> GetDailyTraffic()
        => Ok(await _analyticsService.GetDailyTrafficAsync());

    [HttpGet("top-paths")]
    public async Task<IActionResult> GetTopPaths([FromQuery] int limit = 10)
        => Ok(await _analyticsService.GetTopPathsAsync(limit));

    [HttpGet("status-breakdown")]
    public async Task<IActionResult> GetStatusBreakdown()
        => Ok(await _analyticsService.GetStatusBreakdownAsync());

    [HttpGet("top-hosts")]
    public async Task<IActionResult> GetTopHosts([FromQuery] int limit = 10)
        => Ok(await _analyticsService.GetTopHostsAsync(limit));

    [HttpGet("hourly-traffic")]
    public async Task<IActionResult> GetHourlyTraffic()
        => Ok(await _analyticsService.GetHourlyTrafficAsync());

    [HttpGet("error-rate")]
    public async Task<IActionResult> GetErrorRate()
        => Ok(await _analyticsService.GetErrorRateByDayAsync());

    [HttpGet("host-health")]
    public async Task<IActionResult> GetHostHealth()
        => Ok(await _analyticsService.GetHostHealthAsync());
}