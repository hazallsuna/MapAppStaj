using MapAppStaj.Models;

namespace MapAppStaj.Services
{
    public class CoordinateService: ICoordinateService
    {
        private static readonly List<Coordinate> coordinateList = new List<Coordinate>();

    public Response GetCoordinateList()
    {
            var result = new Response();
            try
            {
                result.Data = coordinateList;
                result.IsSuccess = true;
            }
            catch (Exception ex)
            {
                result.Message = ex.Message;
            }
            return result; }


        public Response GetById(long id)
        {
            var result = new Response();
            try
            {
                var coordinate = coordinateList.FirstOrDefault(c => c.Id == id);
                if (coordinate != null)
                {
                    result.Data = coordinate;
                    result.IsSuccess = true;
                    result.Message = "Coordinate retrieved successfully.";
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "Coordinate not found.";
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"Error occurred while retrieving the coordinate: {ex.Message}";
            }
            return result;
        }

        public Response AddCoordinate(Coordinate coordinate)
        {
            var result = new Response();
            try
            {
                if (coordinate == null)
                {
                    result.IsSuccess = false;
                    result.Message = "Coordinate is null.";
                    return result;
                }

                Random random = new Random();
                int randomId;
                do
                {
                    randomId = random.Next(1, int.MaxValue);
                } while (coordinateList.Any(c => c.Id == randomId));

                coordinate.Id = randomId;
                coordinateList.Add(coordinate);

                result.IsSuccess = true;
                result.Message = "Coordinate added successfully.";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"Error occurred while adding the coordinate: {ex.Message}";
            }
            return result;
        }


        public Response UpdateCoordinate(int id, Coordinate coordinate)
    {
        var result = new Response();
        try
        {
            var oldCoordinate = coordinateList.FirstOrDefault(c => c.Id == id);

            if (oldCoordinate != null)
            {
                oldCoordinate.X_coordinate = coordinate.X_coordinate;
                oldCoordinate.Y_coordinate = coordinate.Y_coordinate;
                oldCoordinate.Name = coordinate.Name;
                result.IsSuccess = true;
                result.Message = "Coordinate updated successfully!";
            }
            else
            {
                result.IsSuccess = false;
            }
        }
        catch (Exception ex)
        {
            result.Message = "Error occured while updating the coordinate.";
        }
        return result;
    }
    public Response DeleteCoordinate(int id)
    {
        var result = new Response();
        try
        {
            var coordinate = coordinateList.FirstOrDefault(c => c.Id == id);
            if (coordinate == null)
            {
                result.Message = "The coordinat not found";
                return result;
            }

            coordinateList.Remove(coordinate);
            result.IsSuccess = true;
            result.Message = "Coordinate deleted successfully";

        }
        catch (Exception)
        {
            result.Message = "Something went wrong";
        }
        return result;
    }

   
}
}

