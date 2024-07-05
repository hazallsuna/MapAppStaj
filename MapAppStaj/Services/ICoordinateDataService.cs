using MapAppStaj.Models;

namespace MapAppStaj.Services
{
    public interface ICoordinateDataService
    {
        List<Coordinate> GetCoordinateList();
        Coordinate GetById(int id);
        void AddCoordinate(Coordinate coordinate);
        void UpdateCoordinate(int id, Coordinate coordinate);
        void DeleteCoordinate(int id);
    }

}
