using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2324_a12.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using prid_2324_a12.Helpers;
using MySql.Data.MySqlClient;
using System.Data;

namespace prid_2324_a12.Models;

public class SqlDTO{

    public int QuestionId{get;set;}
    public string Query{get;set;} = null!;
    public string DbName{get; set;}=null!;
    public bool NewAnswer {get;set;}
    public int AttemptId{get;set;}


    public SqlSolutionDTO ExecuteQuery()
    {
        // Your connection string, replace with actual details
        string connectionString = $"server=localhost;database={this.DbName};uid=root;password=root";

        using MySqlConnection connection = new MySqlConnection(connectionString);
        DataTable table = new DataTable();
        try
        {
            connection.Open();
            MySqlCommand command = new MySqlCommand($"SET sql_mode = 'STRICT_ALL_TABLES'; {this.Query}", connection);
            MySqlDataAdapter adapter = new MySqlDataAdapter(command);
            adapter.Fill(table);
        }
        catch (Exception e)
        {
            // Handle the exception
            Console.WriteLine($"Error: {e.Message}");
            return new SqlSolutionDTO
            {
                Error = new string[] { e.Message }
            }; // Return SqlSolutionDTO with the error message
        }

        // Get column names
        string[] columns = new string[table.Columns.Count];
        for (int i = 0; i < table.Columns.Count; ++i)
            columns[i] = table.Columns[i].ColumnName;


        // Get data
        string[][] data = new string[table.Rows.Count][];
        for (int j = 0; j < table.Rows.Count; ++j)
        {
            data[j] = new string[table.Columns.Count];
            for (int i = 0; i < table.Columns.Count; ++i)
            {
                object value = table.Rows[j][i];
                string str;
                if (value == null)
                    str = "NULL";
                else
                {
                    if (value is DateTime d)
                    {
                        if (d.TimeOfDay == TimeSpan.Zero)
                            str = d.ToString("yyyy-MM-dd");
                        else
                            str = d.ToString("yyyy-MM-dd hh:mm:ss");
                    }
                    else
                        str = value?.ToString() ?? "";
                }
                data[j][i] = str;
            }
        }
        return new SqlSolutionDTO(){
            Data = data, ColumnNames = columns, DbName = this.DbName
        };
    }
    
}