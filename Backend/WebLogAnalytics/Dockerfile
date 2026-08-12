FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["WebLogAnalytics.csproj", "./"]
RUN dotnet restore "WebLogAnalytics.csproj"
COPY . .
RUN dotnet publish "WebLogAnalytics.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "WebLogAnalytics.dll"]
