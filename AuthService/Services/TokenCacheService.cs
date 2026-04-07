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

    }
}