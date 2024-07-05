using MapAppStaj.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MapAppStaj.Services
{
    public class CoordinateDataService : ICoordinateDataService
    {

        private readonly MyDbContext _context;
        public CoordinateDataService(MyDbContext context)
        {
            _context = context;
        }
        public List<Coordinate> GetCoordinateList()
        {
            /*string sql = "SELECT * FROM coordinate";
            return _context.Coordinates.FromSqlRaw(sql).ToList();*/
            return _context.Coordinates.ToList();
        }

        public Coordinate GetById(int id)
        {
            /*string sql = "SELECT *FROM coordinate WHERE id= @Id";
            return _context.Coordinates.FromSqlRaw(sql,new NpgsqlParameter("@Id",id)).FirstOrDefault();*/
            return _context.Coordinates.First(c => c.Id == id);
        }

        public void AddCoordinate(Coordinate coordinate)
        {
            /*string sql = "INSERT INTO coordinate (x_coordinate, y_coordinate, Name) VALUES (@X, @Y, @Name)";
            _context.Database.ExecuteSqlRaw(sql,
                new NpgsqlParameter("@X", coordinate.X_coordinate),
                new NpgsqlParameter("@Y", coordinate.Y_coordinate),
                new NpgsqlParameter("@Name", coordinate.Name));*/

            _context.Coordinates.Add(coordinate);
            _context.SaveChanges();
        }

        public void UpdateCoordinate(int id, Coordinate coordinate)
        {

            /*string sql = "UPDATE coordinate SET x_coordinate=@X, y_coordinate=@Y, Name=@Name WHERE Id = @Id";
            _context.Database.ExecuteSqlRaw(sql,
                new NpgsqlParameter("@X",coordinate.X_coordinate),
                new NpgsqlParameter("@Y",coordinate.Y_coordinate),
                new NpgsqlParameter("@Name",coordinate.Name), 
                new NpgsqlParameter("@Id",id));*/

            var oldCoordinate = _context.Coordinates.FirstOrDefault(c => c.Id == id);

            if (oldCoordinate != null)
            {
                oldCoordinate.X_coordinate = coordinate.X_coordinate;
                oldCoordinate.Y_coordinate = coordinate.Y_coordinate;
                oldCoordinate.Name = coordinate.Name;
                _context.SaveChanges();
            }
        }

        public void DeleteCoordinate(int id)
        {

            /*string sql = "DELETE FROM coordinate WHERE Id = @Id";
            _context.Database.ExecuteSqlRaw(sql, new NpgsqlParameter("@Id", id));*/

            try
            {
                var coordinate = _context.Coordinates.FirstOrDefault(c => c.Id == id);
                if (coordinate != null)
                {
                    _context.Coordinates.Remove(coordinate);
                    _context.SaveChanges();
                }
            }
            catch (DbUpdateException ex)
            {
               
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }

        }
    }
}
