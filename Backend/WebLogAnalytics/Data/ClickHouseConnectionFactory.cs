using ClickHouse.Client.ADO;

namespace WebLogAnalytics.Data;

public class ClickHouseConnectionFactory
{
    private readonly IConfiguration _configuration;

    public ClickHouseConnectionFactory(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public ClickHouseConnection CreateConnection()
    {
        var connectionString =
            _configuration.GetConnectionString("ClickHouse");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ClickHouse connection string is not configured."
            );
        }

        return new ClickHouseConnection(connectionString);
    }
}