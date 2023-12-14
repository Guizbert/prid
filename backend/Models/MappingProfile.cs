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

        CreateMap<Quiz, QuizDTO>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions));

        CreateMap<QuizDTO, Quiz>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions.Select(q => new Question { Id = q.Id, Order = q.Order, Body = q.Body, QuizId = q.QuizId })));

        CreateMap<Question, QuestionDTO>()
            .ForMember(dest => dest.QuizName, opt => opt.MapFrom(src => src.Quiz.Name))
            .ForMember(dest => dest.Database, opt => opt.MapFrom(src => src.Quiz.Database));
        CreateMap<QuestionDTO, Question>();


        CreateMap<Solution,SolutionDTO>();
        CreateMap<SolutionDTO,Solution>();

        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();
       
    }
}