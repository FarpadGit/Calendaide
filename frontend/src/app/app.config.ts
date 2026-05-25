import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { hu } from 'primelocale/hu.json';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    providePrimeNG({
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '#d4e5f7',
              100: '#b5d2f1',
              200: '#95c0eb',
              300: '#76ade4',
              400: '#569bde',
              500: '#3788d8',
              600: '#2e73b8',
              700: '#255f98',
              800: '#1d4a77',
              900: '#143657',
              950: '#0b2137',
            },
          },
          components: {
            avatar: {
              root: {
                background: '{primary.100}',
              },
            },
            button: {
              text: {
                secondary: {
                  activeBackground: '{primary.100} !important',
                  hoverBackground: '{primary.50} !important',
                },
              },
            },
            confirmpopup: {
              css: '.p-confirmpopup-content { max-width: 27rem; }',
            },
            datepicker: {
              date: {
                hoverBackground: '{primary.100}',
              },
              today: {
                background: '{primary.50} !important',
              },
              selectMonth: {
                hoverBackground: '{primary.50}',
              },
              selectYear: {
                hoverBackground: '{primary.50}',
              },
              css: `
              .p-motion { width: 100%; }
              .field p-datepicker .p-motion {
                @media (max-width: 640px) {
                  width: fit-content;
                }
              }`,
            },
            dialog: {
              css: `
              .p-dialog { 
                max-height: 95%; 
                max-width: 100vw;
              } 
              .p-dialog-content:has(.p-datepicker-panel) { 
                overflow-y: visible;
              }`,
            },
            floatlabel: {
              root: {
                color: '{primary.500}',
                activeColor: '{primary.500}',
              },
            },
            menu: {
              item: {
                focusBackground: '{primary.50}',
                focusColor: '{primary.700}',
                color: '{primary.500}',
              },
            },
            panel: {
              root: {
                background: '{primary.contrastColor}',
                borderColor: 'transparent',
              },
            },
            progressspinner: {
              root: {
                colorTwo: '{blue.800} !important',
              },
              css: '.p-progressspinner { width: 22px; height: 22px; }',
            },
            select: {
              root: {
                borderColor: '{primary.500}',
              },
            },
            tooltip: {
              root: {
                maxWidth: '18rem',
              },
            },
          },
        }),
      },
      translation: hu,
    }),
  ],
};
