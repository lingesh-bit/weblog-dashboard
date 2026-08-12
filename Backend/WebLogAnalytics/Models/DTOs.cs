namespace WebLogAnalytics.Models;

public record DailyTraffic(
    DateTime Day,
    long Requests
);

public record TopPath(
    string Path,
    long Requests
);

public record StatusBreakdown(
    int StatusCode,
    long Requests,
    double Pct
);

public record TopHost(
    string Host,
    long Requests,
    long TotalBytes
);

public record HourlyTraffic(
    int HourOfDay,
    long TotalBytes,
    long Requests
);

public record ErrorRateByDay(
    DateTime Day,
    long Errors,
    long Total,
    double ErrorPct
);

public record HostHealth(
    string Host,
    int CpuPercent,
    int MemoryPercent,
    int DiskPercent,
    string Status
);