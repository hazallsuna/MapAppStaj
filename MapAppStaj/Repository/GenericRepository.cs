
using Microsoft.EntityFrameworkCore;

namespace MapAppStaj.Repository
{
    public class GenericRepository <TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        private readonly MyDbContext _dbContext;
        private readonly DbSet <TEntity> _dbSet;
        public GenericRepository(MyDbContext dbContext)
        {
            _dbContext = dbContext;
            _dbSet = dbContext.Set<TEntity>();
        }
        public List<TEntity> GetCoordinateList()
        {
              return _dbSet.ToList();
        }

        public TEntity GetById(int id)
        {
            return _dbSet.Find(id);
        }

        public void AddCoordinate(TEntity entity)
        {
            _dbSet.Add(entity);
            _dbContext.SaveChanges();
        }

        public async void UpdateCoordinate(int id, TEntity entity)
        {
              _dbSet.Update(entity);
              await _dbContext.SaveChangesAsync();
        }

        public void DeleteCoordinate(int id)
        {
            TEntity entity = _dbSet.Find(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                _dbContext.SaveChanges();
            }
        }

       

        
    }
}
