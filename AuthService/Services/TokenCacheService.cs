using Microsoft.Extensions.Caching.Distributed;

namespace AuthService.Services
{
    public class TokenCacheService
    {
        private readonly IDistributedCache _redisCache;

        public TokenCacheService(IDistributedCache redisCache)
        {
            _redisCache = redisCache;
        }

        public async Task RevokeTokenAsync(string jti, TimeSpan expiration)
        {
            var options = new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = expiration };
            await _redisCache.SetStringAsync($"blacklist:{jti}", "revoked", options);
        }

        public async Task<bool> IsTokenBlacklistedAsync(string jti)
        {
            var token = await _redisCache.GetStringAsync($"blacklist:{jti}");
            return token != null;
        }
    }
}