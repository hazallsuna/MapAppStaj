using MapAppStaj.Models;

namespace MapAppStaj.Services
{
    public interface ICoordinateService
    {
        Response GetCoordinateList();
        Response GetById(long id);
        Response AddCoordinate(Coordinate coordinate);
        Response UpdateCoordinate(int id, Coordinate coordinate);
        Response DeleteCoordinate(int id);
    }
}
