using AutoMapper;

namespace prid_2324_a12.Models;

public class MappingProfile : Profile
{
    private MsnContext _context;

    

    public MappingProfile(MsnContext context){
        _context = context;

        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>()
            .ForMember(dst => dst.RefreshToken, opt => opt.Ignore());

        CreateMap<User, UserWithPasswordDTO>();
        CreateMap<UserWithPasswordDTO, User>();

        CreateMap<Quiz, QuizDTO>();
        CreateMap<QuizDTO, Quiz >();
        
        CreateMap<Question, QuestionDTO>();
        CreateMap<QuestionDTO, Question >();
    }
}