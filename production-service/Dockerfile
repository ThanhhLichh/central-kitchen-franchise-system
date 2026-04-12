# Stage 1: Build ứng dụng
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj vào trước để khôi phục các thư viện
COPY ["Production Service.csproj", "./"]
RUN dotnet restore "./Production Service.csproj"

# Copy toàn bộ code còn lại và tiến hành build
COPY . .
RUN dotnet publish "Production Service.csproj" -c Release -o /app/publish

# Stage 2: Chạy ứng dụng (Dùng image runtime cho nhẹ)
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Mở port mặc định của .NET Web API
EXPOSE 8080

# Lệnh khởi động
ENTRYPOINT ["dotnet", "Production Service.dll"]