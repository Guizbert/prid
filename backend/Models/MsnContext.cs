using Microsoft.EntityFrameworkCore;

namespace prid_2324_a12.Models;

public class MsnContext : DbContext
{


    public MsnContext(DbContextOptions<MsnContext> options)
        : base(options) {

    }

        protected override void OnModelCreating(ModelBuilder modelBuilder){
            base.OnModelCreating(modelBuilder);


            /***** USER *****/
            modelBuilder.Entity<User>()
                .Property(u => u.Id)
                .ValueGeneratedOnAdd();
                //https://stackoverflow.com/questions/36155429/auto-increment-on-partial-primary-key-with-entity-framework-core


            modelBuilder.Entity<User>()
                .HasIndex(m => m.Id)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(m => m.Pseudo)
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(m => m.Email)
                .IsUnique();

            modelBuilder.Entity<Teacher>()
                .HasBaseType<User>();

            modelBuilder.Entity<Student>()
                .HasBaseType<User>();

            modelBuilder.Entity<User>()
                .HasMany(u => u.Attempts)
                .WithOne(u => u.User)
                .OnDelete(DeleteBehavior.ClientCascade);


            /***** ATTEMPT *****/

            modelBuilder.Entity<Attempt>()
                .Property(a => a.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Attempt>()
                .HasIndex(a => a.Id)
                .IsUnique();

            modelBuilder.Entity<Attempt>()
                .HasOne(a => a.User);

            /***** ANSWER *****/

            modelBuilder.Entity<Answer>()
                .Property(a => a.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Answer>()
                .HasIndex(a => a.Id)
                .IsUnique();

            modelBuilder.Entity<Answer>()
                .HasOne(a => a.Attempt);
            // modelBuilder.Entity<Answer>()


            /***** QUIZZ *****/
            modelBuilder.Entity<Quiz>()
                .Property(q => q.Id)
                .ValueGeneratedOnAdd();
                
            modelBuilder.Entity<Quiz>()
                .HasIndex(q => q.Id)
                .IsUnique();
            
            // modelBuilder.Entity<Quiz>()
            //     .HasOne(q => q.Database);
            
            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Questions)
                .WithOne(questions => questions.Quiz)
                .HasForeignKey(questions => questions.QuizId)
                .OnDelete(DeleteBehavior.ClientCascade);

            modelBuilder.Entity<Quiz>()
                .HasMany(q => q.Attempts)
                .WithOne(a => a.Quiz)
                .OnDelete(DeleteBehavior.ClientCascade);

            /***** QUESTION *****/
            modelBuilder.Entity<Question>()
                .Property(q => q.Id)
                .ValueGeneratedOnAdd();

            modelBuilder.Entity<Question>()
                .HasIndex(q => q.Id)
                .IsUnique();

            modelBuilder.Entity<Question>()
                .HasMany(q => q.Solutions)
                .WithOne(s => s.Question)
                .HasForeignKey(s => s.QuestionId)
                .OnDelete(DeleteBehavior.ClientCascade);

            /***** SOLUTION *****/

            modelBuilder.Entity<Solution>()
                .Property(s => s.Id)
                .ValueGeneratedOnAdd();
            modelBuilder.Entity<Solution>()
                .HasIndex(s => s.Id)
                .IsUnique();
            modelBuilder.Entity<Solution>()
                .HasOne(s => s.Question);

            //si lastName || FirstName != null alors faut faire la validation

            modelBuilder.Entity<User>().HasData(
                        new User { Id=1, Pseudo = "ben", Password = "ben" , Email="ben.epfc@eu"},
                        new User { Id=2, Pseudo = "bruno", Password = "bruno", Email="bruno.epfc@eu" },
                        new User { Id=3,Pseudo = "alain", Password = "alain", Email="alain.epfc@eu" },
                        new User { Id=4, Pseudo = "xavier", Password = "xavier", Email="xavier.epfc@eu" },
                        new User { Id=5, Pseudo = "boris", Password = "boris", Email="boris.epfc@eu" },
                        new User { Id=6, Pseudo = "marc", Password = "marc", Email="marc.epfc@eu"},
                        new User { Id=7, Pseudo = "admin", Password = "admin", Email="admin.epfc@eu", Role= Role.Teacher}
                    );

            // modelBuilder.Entity<Answer>().HasData(
            //     new Answer();
            // )

            
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Answer> Answers => Set<Answer>();
        public DbSet<Attempt> Attempts => Set<Attempt>();
        public DbSet<Database> Databases => Set<Database>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<Quiz> Quizzes => Set<Quiz>();
        public DbSet<Solution> Solutions => Set<Solution>();
}