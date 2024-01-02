using AutoMapper;

namespace prid_2324_a12.Models;

public class MappingProfile : Profile
{
    private MsnContext _context;

    

    public MappingProfile(MsnContext context){
        _context = context;

        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>()
            .ForMember(dst => dst.RefreshToken, opt => opt.Ignore())
            .ForMember(dst => dst.Attempts, opt => opt.MapFrom(src => src.Attempts));

        CreateMap<User, UserWithPasswordDTO>();
        CreateMap<UserWithPasswordDTO, User>();

        CreateMap<Quiz, QuizDTO>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions))
            .ForMember(dst => dst.Attempts, opt => opt.MapFrom(src => src.Attempts));

        CreateMap<QuizSaveDTO, Quiz>();//NEW quiz
        CreateMap<Quiz, QuizSaveDTO>();

        CreateMap<Quiz, QuizUpdateDTO>();//EDIT quiz
        CreateMap<QuizUpdateDTO, Quiz>();
        
        CreateMap<QuizDTO, Quiz>()
            .ForMember(dest => dest.Questions, opt => opt.MapFrom(src => src.Questions.Select(q => new Question { Id = q.Id, Order = q.Order, Body = q.Body, QuizId = q.QuizId })))
            .ForMember(dst => dst.Attempts, opt => opt.MapFrom(src => src.Attempts));


        CreateMap<Question, QuestionDTO>()
            .ForMember(dest => dest.QuizName, opt => opt.MapFrom(src => src.Quiz.Name))
            .ForMember(dest => dest.Database, opt => opt.MapFrom(src => src.Quiz.Database));
        CreateMap<QuestionDTO, Question>();

        CreateMap<Question, QuestionSaveDTO>();
        CreateMap<QuestionSaveDTO, Question>();

       

        CreateMap<Solution,SolutionDTO>();
        CreateMap<SolutionDTO,Solution>();

        CreateMap<Answer, AnswerDTO>();
        CreateMap<AnswerDTO, Answer>();

        CreateMap<Attempt, AttemptDTO>()
            .ForMember(dest => dest.Answers, opt=>opt.MapFrom(src => src.Answers));
        CreateMap<AttemptDTO, Attempt>()
            .ForMember(dest => dest.Answers, opt=>opt.MapFrom(src => src.Answers));

    }
}