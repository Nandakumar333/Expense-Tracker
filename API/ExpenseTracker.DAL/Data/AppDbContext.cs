using ExpenseTracker.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ExpenseTracker.DAL.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<UserEntity> Users { get; set; }
        public DbSet<UserProfileEntity> UserProfiles { get; set; }
        public DbSet<UserSettingsEntity> UserSettings { get; set; }
        public DbSet<AccountEntity> Accounts { get; set; }
        public DbSet<CategoryEntity> Categories { get; set; }
        public DbSet<TransactionEntity> Transactions { get; set; }
        public DbSet<BudgetEntity> Budgets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<UserEntity>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();

                entity.HasOne(u => u.Profile)
                    .WithOne(p => p.User)
                    .HasForeignKey<UserProfileEntity>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.Settings)
                    .WithOne(s => s.User)
                    .HasForeignKey<UserSettingsEntity>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Accounts)
                    .WithOne(a => a.User)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Categories)
                    .WithOne(c => c.User)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Transactions)
                    .WithOne(t => t.User)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.Budgets)
                    .WithOne(b => b.User)
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Add soft delete query filter for Users
            modelBuilder.Entity<UserEntity>().HasQueryFilter(u => !u.IsDeleted);

            // Configure enums to be stored as strings
            modelBuilder.Entity<CategoryEntity>()
                .Property(e => e.Type)
                .HasConversion<string>();

            modelBuilder.Entity<BudgetEntity>()
                .Property(e => e.Period)
                .HasConversion<string>();

            // Configure unique constraints
            modelBuilder.Entity<CategoryEntity>()
                .HasIndex(c => new { c.UserId, c.Name })
                .IsUnique();

            modelBuilder.Entity<AccountEntity>()
                .HasIndex(a => new { a.UserId, a.Name })
                .IsUnique();

            // Configure one-to-one relationship between User and UserSettings
            modelBuilder.Entity<UserEntity>()
                .HasOne(u => u.Settings)
                .WithOne(us => us.User)
                .HasForeignKey<UserSettingsEntity>(us => us.UserId);

            // Configure decimal precision for money-related fields
            modelBuilder.Entity<AccountEntity>()
                .Property(a => a.Balance)
                .HasColumnType("decimal(15,2)");

            modelBuilder.Entity<TransactionEntity>()
                .Property(t => t.Amount)
                .HasColumnType("decimal(15,2)");

            modelBuilder.Entity<BudgetEntity>()
                .Property(b => b.Amount)
                .HasColumnType("decimal(15,2)");

            // Configure cascade delete behavior
            modelBuilder.Entity<CategoryEntity>()
                .HasMany(c => c.SubCategories)
                .WithOne(c => c.ParentCategory)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserEntity>()
                .HasMany(u => u.Categories)
                .WithOne(c => c.User)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEntity>()
                .HasMany(u => u.Accounts)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEntity>()
                .HasMany(u => u.Transactions)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEntity>()
                .HasMany(u => u.Budgets)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Category configuration
            modelBuilder.Entity<CategoryEntity>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // Self-referencing relationship
                entity.HasOne(e => e.ParentCategory)
                    .WithMany(e => e.SubCategories)
                    .HasForeignKey(e => e.ParentId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.Restrict);

                // User relationship
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Categories)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Unique constraint for category name within same parent and user
                entity.HasIndex(e => new { e.UserId, e.ParentId, e.Name })
                    .IsUnique();

                // Configure properties
                entity.Property(e => e.Path)
                    .HasMaxLength(255)
                    .IsRequired();

                entity.Property(e => e.Level)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // Transaction configuration
            modelBuilder.Entity<TransactionEntity>(entity =>
            {
                entity.Property(e => e.Amount)
                    .HasColumnType("decimal(18,2)");

                entity.HasOne(t => t.Category)
                    .WithMany()
                    .HasForeignKey(t => t.CategoryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(t => t.Account)
                    .WithMany(a => a.Transactions)
                    .HasForeignKey(t => t.AccountId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.User)
                    .WithMany(u => u.Transactions)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is UserEntity && e.State == EntityState.Modified);

            foreach (var entityEntry in entries)
            {
                ((UserEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}