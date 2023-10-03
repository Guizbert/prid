using Microsoft.EntityFrameworkCore;

namespace prid_2324_a12.Models;

public class MsnContext : DbContext
{


    public MsnContext(DbContextOptions<MsnContext> options)
        : base(options) {

    }

        protected override void OnModelCreating(ModelBuilder modelBuilder){
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .ValueGeneratedOnAdd();
                //https://stackoverflow.com/questions/36155429/auto-increment-on-partial-primary-key-with-entity-framework-core


            modelBuilder.Entity<User>()
                .HasIndex(m => m.Pseudo)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(m => m.Email)
                .IsUnique();


                //photo .isunique()

                


            //si lastName || FirstName != null alors faut faire la validation

            modelBuilder.Entity<User>().HasData(
                        new User { Id=1, Pseudo = "ben", Password = "ben" , Email="ben.epfc@eu"},
                        new User { Id=2, Pseudo = "bruno", Password = "bruno", Email="bruno.epfc@eu" },
                        new User { Id=3,Pseudo = "alain", Password = "alain", Email="alain.epfc@eu" },
                        new User { Id=4, Pseudo = "xavier", Password = "xavier", Email="xavier.epfc@eu" },
                        new User { Id=5, Pseudo = "boris", Password = "boris", Email="boris.epfc@eu" },
                        new User { Id=6, Pseudo = "marc", Password = "marc", Email="marc.epfc@eu"}
                    );

            
        }

        public DbSet<User> Users => Set<User>();

}