import { AfterViewInit, Component, ElementRef, Input, ViewChild, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { QuestionService } from "src/app/services/question.service";

import * as ace from "ace-builds";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/ext-language_tools";
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-merbivore';
import 'ace-builds/src-noconflict/theme-pastel_on_dark';
import 'ace-builds/src-noconflict/theme-tomorrow_night_blue';
import 'ace-builds/src-noconflict/theme-sqlserver';
import { Database } from "src/app/models/database";


@Component({
    selector: "code-editor",
    template: `
    <form #codeForm="ngForm">
        <div class="app-ace-editor" #editor style="width: 100%;margin-top:8px;margin-bottom:8px"></div>
    </form>
    `,
    styles: [`
      .app-ace-editor {
        border: 2px solid #f8f9fa;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }`,
    ],
    // Déclare un fournisseur de NG_VALUE_ACCESSOR pour indiquer comment le composant doit fonctionner en tant que 
    // contrôle Angular, ce qui permet de lier des valeurs bidirectionnelles avec [(ngModel)] ou [ngModel].
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            // indique à Angular quel composant doit être utilisé pour le binding
            useExisting: forwardRef(() => CodeEditorComponent),
            // doit tjrs être true
            multi: true,
        }
    ]
})
export class CodeEditorComponent implements AfterViewInit, ControlValueAccessor {

    /*
    L'interface ControlValueAccessor est une partie essentielle de la configuration qui permet à un composant 
    personnalisé d'être utilisé avec ngModel pour la liaison de données bidirectionnelle. Elle détermine comment 
    le composant interagit avec ngModel et quelles méthodes et propriétés il doit mettre en œuvre. Cette interface 
    permet à un composant d'agir comme un contrôle Angular.
    */

    constructor(
        private questionService: QuestionService
        ) {
            CodeEditorComponent._questionService = questionService;  // Initialisez la propriété statique
        }

    // permet d'accéder à l'objet DOM qui correspond au DIV qui contient l'éditeur
    @ViewChild("editor") private _editor!: ElementRef<HTMLElement>;
    // contient le code entré dans l'éditeur
    private _code: string = "";
    // référence vers une interface de la lib pour pouvoir configurer l'éditeur
    private _aceEditor?: ace.Ace.Editor;
    // détermine si l'éditeur est en lecture seule
    private _readOnly: boolean = false;

    // get readonly():boolean{
    //     return CodeEditorComponent.readOnly;
    // }
    // @Input() set readonly(value: boolean):boolean{
    //     CodeEditorComponent.readOnly = value;

    // }
    // contient la fonction de callback qui sera appelée quand la valeur de l'éditeur change
    private _onChange: any;
    completion: any[] = [];
    //nom de la db a utiliser:

    private static _database: Database;

    get database(): Database  {
        return CodeEditorComponent._database!;
    }
    @Input() set database(value: Database) {
        CodeEditorComponent._database = value;
    }
    
    private static _questionService: QuestionService;  

    ngAfterViewInit(): void {
        ace.config.set("fontSize", "1.5rem");
        this._aceEditor = ace.edit(this._editor.nativeElement);
        this._aceEditor!.setReadOnly(this.readOnly);
        this._aceEditor.setShowPrintMargin(false);
        // indique que l'éditeur doit permettre de gérer du code SQL pour MySQL
        this._aceEditor.session.setMode("ace/mode/mysql");
        this._aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: false,
            enableLiveAutocompletion: true,
            minLines: 5,
            maxLines: 15,
            showGutter: false,
        });
        // Quand on détecte que la valeur de l'éditeur a changé, il faut déclencher le binding
        this._aceEditor.on("input", () => {
            this._code = this._aceEditor!.getValue();
            this._onChange(this._code);
        });
        this.setTheme('ace/theme/dracula');
        console.log("theme : " + this._aceEditor.getTheme());

        this._aceEditor.setValue(this._code, -1);
        this._aceEditor.resize();
        // Configuration de la complétion automatique
        ace.config.loadModule("ace/ext/language_tools", function () {
            const langTools = ace.require("ace/ext/language_tools");
            langTools.addCompleter({
                getCompletions: async (editor:any, session: any, pos: any, prefix: any, callback: any) => {
                    // Si le préfixe (texte précédant la position du curseur) est vide, il n'y a aucune suggestion.
                    if (prefix.length === 0) {
                        callback(null, []);
                        return
                    }

                    // Récupère les noms des tables, des colonnes et des mots-clés.
                    const tables = await CodeEditorComponent.getTableNames(CodeEditorComponent._database.name!);
                    const columns = await CodeEditorComponent.getColumnNames(CodeEditorComponent._database.name!);
                    const keywords = CodeEditorComponent.getKeywords();


                    // Crée un tableau pour stocker les différents types de complétions.
                    const completions: any[] = [];

                    //Pour chaque nom de table, ajoute une complétion.
                    tables.forEach((table: any) => {
                       completions.push({caption: table, value: table, meta: "Table", score: 100});
                    });
//
                    // Pour chaque colonne, ajoute une complétion.
                    columns.forEach((column: any) => {
                       completions.push({caption: column, value: column, meta: "Column", score: 100});
                    });

                    // Pour chaque mot-clé, ajoute une complétion.
                    keywords.forEach((keyword: any) => {
                        completions.push({caption: keyword, value: keyword, meta: "Keyword", score: 75});
                    });

                    console.log(completions);
                    // Appelle la fonction de callback avec les suggestions d'achèvement.
                    callback(null, completions);
                }
            });
        });
    }

    private static getTableNames(dbname: string): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            CodeEditorComponent._questionService.getData(dbname).subscribe((res: any)=> {
                resolve(res);
            });
        });
    }
    
    private static getColumnNames(dbname: string): Promise<any[]> {
        return new Promise<any[]>((resolve) => {
            CodeEditorComponent._questionService.getColumns(dbname).subscribe((res: any)=> {
                resolve(res);
            });
        });
    }
    
    

    /**
     * Renvoie un tableau contenant les mots-clés du langage SQL a afficher dans la complétion.
     * Nous y avons mis les principaux, mais cette liste n'est pas exhaustive.
     */
    private static getKeywords() {
        return [
            'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
            'LIMIT', 'OFFSET', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'FULL OUTER JOIN', 'CROSS JOIN', 'UNION', 'UNION ALL', 'AS',
            'DISTINCT', 'ALL', 'BETWEEN', 'CASE', 'WHEN', 'THEN', 'ELSE',
            'END', 'EXISTS', 'IN', 'LIKE', 'ILIKE', 'SIMILAR TO', 'NOT', 'AND', 'OR',
            'IS NULL', 'IS NOT NULL', 'ANY', 'ALL', 'SOME', 'EXTRACT',
            'DATE_PART', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND',
            'TRUNCATE', 'CONCAT', '||', 'SUBSTR', 'LEFT', 'RIGHT',
            'LOWER', 'UPPER', 'INITCAP', 'LENGTH', 'CHAR_LENGTH',
            'POSITION', 'STRPOS', 'CAST', 'COALESCE',
            'NULLIF', 'LEAD', 'LAG', 'FIRST_VALUE', 'LAST_VALUE',
            'NTH_VALUE', 'OVER', 'PARTITION BY', 'RANK', 'DENSE_RANK',
            'ROW_NUMBER', 'FETCH FIRST', 'ROWS ONLY', 'LATERAL', 'TABLE',
            'XMLTABLE', 'JSON_TABLE', 'PIVOT', 'UNPIVOT', 'ROLLUP',
            'CUBE', 'GROUPING SETS', 'FILTER', 'WINDOW', 'OVERLAPS',
            'CONTAINS', 'FREETEXT'
        ];
    }


    // Dans votre composant CodeEditorComponent
    setTheme(theme: string): void {
        if (this._aceEditor) {
            this._aceEditor.setTheme(theme);
        }
    }
    /*
     * Implémentation de l'interface ControlValueAccessor
     */

    // Cette méthode est appelée par Angular lorsque la valeur de la liaison de données doit être 
    // mise à jour à partir du modèle.
    writeValue(value: any) {
        this._code = value;
        if (this._aceEditor) {
            const cursorPos = this._aceEditor.getCursorPosition();
            this._aceEditor.setValue(this._code, -1);
            this._aceEditor.moveCursorToPosition(cursorPos);
        }
    }

    // Cette méthode permet d'enregistrer un callback que le composant doit appeler chaque fois 
    // que sa valeur change. Cette fonction de rappel est fournie par ngModel.
    registerOnChange(fn: any) {
        this._onChange = fn;
    }

    registerOnTouched(fn: any) {
        // pas implémentée
    }

    /**
     * Permet de donner le focus à l'éditeur de code.
     */
    focus(): void {
        this._aceEditor?.focus();
    }

    /**
     * Permet de mettre l'éditeur en mode lecture seule.
     */
    get readOnly(): boolean {
        return this._readOnly;
    }

    @Input() set readOnly(val: boolean) {
        this._readOnly = val;
        this._aceEditor?.setReadOnly(val);
    }
}