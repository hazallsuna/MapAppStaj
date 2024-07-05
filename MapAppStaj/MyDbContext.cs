using MapAppStaj.Models;
using Microsoft.EntityFrameworkCore;

namespace MapAppStaj
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options, IConfiguration configuration) : base(options)
        {
            _configuration = configuration;
        }
        IConfiguration _configuration { get; set; }
        public MyDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public DbSet<Coordinate> Coordinates { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Coordinate>().ToTable("coordinate");
            modelBuilder.Entity<Coordinate>(opt =>
            {   
                opt.HasKey(a => a.Id);
                opt.Property(a => a.Id).HasColumnName("id").ValueGeneratedOnAdd();
                opt.Property(a => a.X_coordinate).HasColumnName("x_coordinate");
                opt.Property(a => a.Y_coordinate).HasColumnName("y_coordinate");
                opt.Property(a => a.Name).HasColumnName("name");
            });
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseNpgsql(_configuration.GetConnectionString("DefaultConnection"));
            }
            
        }
    }
}
