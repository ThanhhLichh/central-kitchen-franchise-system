# ── Stage 1: Build ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj vào trước để khôi phục các thư viện
COPY ["Production Service.csproj", "./"]
RUN dotnet restore "./Production Service.csproj"

# Copy toàn bộ code còn lại và tiến hành build
COPY . .
RUN dotnet publish "Production Service.csproj" -c Release -o /app/publish

# ── Stage 2: Runtime ────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .
EXPOSE 8080

ENTRYPOINT ["dotnet", "Production Service.dll"]