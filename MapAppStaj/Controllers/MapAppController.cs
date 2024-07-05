using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using MapAppStaj.Services;
using MapAppStaj.Models;
using MapAppStaj.Repository;

namespace MapAppStaj.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinateController : ControllerBase
    {
        private readonly IGenericRepository<Coordinate> _coordinateRepository;
        public CoordinateController(IGenericRepository<Coordinate> coordinateRepository)
        {
            _coordinateRepository = coordinateRepository;
        }

        [HttpGet]
        public IActionResult GetCoordinateList()
        {
            return Ok(_coordinateRepository.GetCoordinateList());
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            return Ok(_coordinateRepository.GetById(id));
        }

        [HttpPost]
        public IActionResult AddCoordinate(Coordinate coordinate)
        {
            _coordinateRepository.AddCoordinate(coordinate);
            return Ok();
        }

        [HttpPut]
        public IActionResult UpdateCoordinate(Coordinate coordinate)
        {
            _coordinateRepository.UpdateCoordinate(coordinate.Id, coordinate);
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteCoordinate(int id)
        {
            _coordinateRepository.DeleteCoordinate(id);
            return Ok();
        }
    }
}
