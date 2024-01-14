import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({ 
    templateUrl: 'signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignUpComponent{
    public signupForm!: FormGroup;
    public ctlPseudo!: FormControl;
    public ctlEmail!: FormControl;
    public ctlFirstname!: FormControl;
    public ctlLastName!: FormControl;
    public ctlPassword!: FormControl;
    public ctlBirthdate!: FormControl;
    public ctlPasswordConfirm!: FormControl;
 
    constructor(
        public authService: AuthenticationService,  // pour pouvoir faire le login
        public router: Router,                      // pour rediriger vers la page d'accueil en cas de login
        private fb: FormBuilder                     // pour construire le formulaire, du côté TypeScript
    ){
        this.ctlPseudo = this.fb.control('', [Validators.required, Validators.minLength(3)], [this.pseudoUsed()]);
        console.log(this.pseudoUsed());
        this.ctlEmail = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlPassword = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlFirstname = this.fb.control('', [Validators.minLength(3)]);
        this.ctlLastName = this.fb.control('', [Validators.minLength(3)]);
        this.ctlPasswordConfirm = this.fb.control('', [Validators.required, Validators.minLength(3)]);
        this.ctlBirthdate = this.fb.control('', [Validators.required]);
        this.signupForm = this.fb.group({
            pseudo: this.ctlPseudo,
            email: this.ctlEmail,
            firstname: this.ctlFirstname,
            lastname: this.ctlLastName,
            password: this.ctlPassword,
            passwordConfirm: this.ctlPasswordConfirm,
        }, { validator: this.crossValidations });
    }

    pseudoUsed(): AsyncValidatorFn {
        let timeout: NodeJS.Timeout;
        return(ctl: AbstractControl) => {
            clearTimeout(timeout);
            const pseudo = ctl.value;
            console.log(ctl.value);
            return new Promise(resolve => {
                timeout = setTimeout(() => {
                    this.authService.isPseudoAvailable(pseudo).subscribe(res => {
                        resolve(res ? null : { pseudoUsed: true});
                    });
                }, 300);
            });
        };
    }

    crossValidations(group: FormGroup): ValidationErrors | null {
        if(!group.value) {return null;}
        const birthdate = new Date(group.value);
        const today = new Date();
        const age = today.getFullYear() - birthdate.getFullYear();
    
        if (today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate())) {
            // Adjust age if birthday hasn't occurred yet this year
            return age - 1 < 18 ? { under18: true } : null;
        }
        return group.value.password === group.value.passwordConfirm ? null : {passwordNotConfirmed: true};
    }

    signup(){
        this.authService.signup(this.ctlPseudo.value, this.ctlEmail.value, this.ctlPassword.value,this.ctlFirstname.value, this.ctlLastName.value, this.ctlBirthdate.value).subscribe(() => {
            if(this.authService.currentUser){
                this.router.navigate(['/quiz']);
            }
        });
    }
}