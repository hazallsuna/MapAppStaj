using MapAppStaj.Models;

namespace MapAppStaj.Repository
{
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        List<TEntity> GetCoordinateList();
        TEntity GetById(int id);
        void AddCoordinate(TEntity entity);
        void UpdateCoordinate(int id, TEntity entity);
        void DeleteCoordinate(int id);
    }
}
