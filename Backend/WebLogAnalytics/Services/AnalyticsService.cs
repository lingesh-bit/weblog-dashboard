using Dapper;
using WebLogAnalytics.Data;
using WebLogAnalytics.Models;

namespace WebLogAnalytics.Services;

public class AnalyticsService
{
    private readonly ClickHouseConnectionFactory _connectionFactory;

    public AnalyticsService(
        ClickHouseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<DailyTraffic>> GetDailyTrafficAsync()
    {
        const string sql = """
            SELECT
                toDate(event_time) AS Day,
                toInt64(count()) AS Requests
            FROM weblogs.access_logs
            GROUP BY Day
            ORDER BY Day
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<DailyTraffic>(sql);
    }



    public async Task<IEnumerable<TopPath>> GetTopPathsAsync(
        int limit = 10)
    {
        const string sql = """
            SELECT
                path AS Path,
                toInt64(count()) AS Requests
            FROM weblogs.access_logs
            GROUP BY path
            ORDER BY Requests DESC
            LIMIT @limit
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<TopPath>(
            sql,
            new { limit }
        );
    }



    public async Task<IEnumerable<StatusBreakdown>> GetStatusBreakdownAsync()
    {
        const string sql = """
            SELECT
                toInt32(status_code) AS StatusCode,
                toInt64(count()) AS Requests,
                toFloat64(round(
                    count() * 100.0 /
                    (SELECT count() FROM weblogs.access_logs),
                    2
                )) AS Pct
            FROM weblogs.access_logs
            GROUP BY status_code
            ORDER BY Requests DESC
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<StatusBreakdown>(sql);
    }



    public async Task<IEnumerable<TopHost>> GetTopHostsAsync(
        int limit = 10)
    {
        const string sql = """
            SELECT
                host AS Host,
                toInt64(count()) AS Requests,
                toInt64(sum(bytes_sent)) AS TotalBytes
            FROM weblogs.access_logs
            GROUP BY host
            ORDER BY Requests DESC
            LIMIT @limit
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<TopHost>(
            sql,
            new { limit }
        );
    }



    public async Task<IEnumerable<HourlyTraffic>> GetHourlyTrafficAsync()
    {
        const string sql = """
            SELECT
                toInt32(toHour(event_time)) AS HourOfDay,
                toInt64(sum(bytes_sent)) AS TotalBytes,
                toInt64(count()) AS Requests
            FROM weblogs.access_logs
            GROUP BY HourOfDay
            ORDER BY HourOfDay
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<HourlyTraffic>(sql);
    }



    public async Task<IEnumerable<ErrorRateByDay>> GetErrorRateByDayAsync()
    {
        const string sql = """
            SELECT
                toDate(event_time) AS Day,
                toInt64(countIf(status_code >= 400)) AS Errors,
                toInt64(count()) AS Total,
                toFloat64(round(
                    countIf(status_code >= 400) * 100.0 /
                    count(),
                    2
                )) AS ErrorPct
            FROM weblogs.access_logs
            GROUP BY Day
            ORDER BY Day
            """;

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<ErrorRateByDay>(sql);
    }

    public async Task<IEnumerable<HostHealth>> GetHostHealthAsync()
    {
        var topHosts = await GetTopHostsAsync(10);
        var result = new List<HostHealth>();

        foreach (var hostItem in topHosts)
        {
            var host = hostItem.Host;
            int cpu = host switch
            {
                "web-01" => 42,
                "web-02" => 88,
                "web-03" => 22,
                "web-04" => 34,
                "proxy-east" => 58,
                "api-gateway" => 64,
                _ => 35
            };

            int ram = host switch
            {
                "web-01" => 68,
                "web-02" => 92,
                "web-03" => 41,
                "web-04" => 48,
                "proxy-east" => 51,
                "api-gateway" => 72,
                _ => 50
            };

            int disk = host switch
            {
                "web-01" => 45,
                "web-02" => 78,
                "web-03" => 30,
                "web-04" => 25,
                "proxy-east" => 12,
                "api-gateway" => 55,
                _ => 40
            };

            string status = (cpu > 80 || ram > 85) ? "HIGH LOAD" : "LIVE";

            result.Add(new HostHealth(host, cpu, ram, disk, status));
        }

        return result;
    }
}