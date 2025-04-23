using AutoMapper;
using ExpenseTracker.Core.Dtos.Account;
using ExpenseTracker.Core.Dtos.Budget;
using ExpenseTracker.Core.Dtos.Category;
using ExpenseTracker.Core.Dtos.Users;
using ExpenseTracker.Core.Dtos.Transaction;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.API.Extensions
{

    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Account
            // User mappings
            CreateMap<UserEntity, UserDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Profile.Email))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Profile.FirstName))
                .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Profile.LastName))
                .ForMember(dest => dest.DefaultCurrency, opt => opt.MapFrom(src => src.Settings.Currency))
                .ForMember(dest => dest.TimeZone, opt => opt.MapFrom(src => src.Settings.TimeZone))
                .ForMember(dest => dest.Language, opt => opt.MapFrom(src => src.Settings.Language));

            CreateMap<UserSettingsEntity, UserSettingsDto>();
            CreateMap<UpdateUserSettingsDto, UserSettingsEntity>()
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore());

            CreateMap<UserProfileEntity, UserDto>()
                .ForMember(dest => dest.DefaultCurrency, opt => opt.Ignore())
                .ForMember(dest => dest.TimeZone, opt => opt.Ignore())
                .ForMember(dest => dest.Language, opt => opt.Ignore());

            CreateMap<UserEntity, UserDto>();
            CreateMap<UserDto, UserEntity>();
            CreateMap<UserRegisterDto, UserEntity>();

            // Budget mappings
            CreateMap<BudgetEntity, BudgetDto>()
                .ForMember(dest => dest.CategoryName, 
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
            CreateMap<CreateBudgetDto, BudgetEntity>();
            CreateMap<UpdateBudgetDto, BudgetEntity>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore());

            // Category mappings
            CreateMap<CategoryEntity, CategoryDto>()
                .ForMember(dest => dest.ParentCategoryName, 
                    opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null));
            CreateMap<CreateCategoryDto, CategoryEntity>();
            CreateMap<UpdateCategoryDto, CategoryEntity>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Path, opt => opt.Ignore())
                .ForMember(dest => dest.Level, opt => opt.Ignore());

            // Transaction mappings
            CreateMap<TransactionEntity, TransactionDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.AccountName, opt => opt.MapFrom(src => src.Account != null ? src.Account.Name : null));

            CreateMap<CreateTransactionDto, TransactionEntity>();
            CreateMap<UpdateTransactionDto, TransactionEntity>();

            // Account mappings
            CreateMap<AccountEntity, AccountDto>();
            CreateMap<CreateAccountDto, AccountEntity>();
            CreateMap<UpdateAccountDto, AccountEntity>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
