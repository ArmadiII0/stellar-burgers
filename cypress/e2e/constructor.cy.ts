import * as orderFixture from '../fixtures/order.json';

const dataCyBun = '[data-cy="bun"]';
const dataCyBunFirst = '[data-cy="bun"]:first-of-type';
const dataCyOrder = '[data-cy-order]';
const modals = '#modals';
const dataCyConstructor = '.HEJ0tV35JHL7iuHL89vk';
const baseUrl = 'http://localhost:4000';

describe('Тест бургерной', () => {
  beforeEach(() => {
    cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients' });
    cy.visit(baseUrl);
  });

  it('Проверка ингредиентов', () => {
    cy.get(dataCyBun).should('have.length.at.least', 1);
    cy.get('[data-cy="main"], [data-cy="souce"]').should('have.length.at.least', 1);
  });

  describe('Тест модальных окон / страницы ингредиента', () => {
    it('Открытие карточки ингредиента и проверка контента', () => {
      cy.get(dataCyBunFirst)
        .find('p, span, h3')
        .invoke('text')
        .then((ingredientName) => {
          cy.log('Название ингредиента:', ingredientName);
          cy.get(dataCyBunFirst).click();
          cy.url().should('include', '/ingredients/');
          cy.contains(ingredientName.trim()).should('be.visible');
        });
    });

    it('Открытие карточки ингредиента после перезагрузки', () => {
      cy.get(dataCyBunFirst).click();
      cy.reload(true);
      cy.url().should('include', '/ingredients/');
    });
  });

  describe('Тест закрытия модального окна', () => {
    it('Нажимаем крест', () => {
      cy.get(dataCyBunFirst).click();
      cy.get(`${modals} button:first-of-type`).click();
      cy.wait(1000);
      cy.get(modals).children().should('have.length', 0);
    });

    it('Нажимаем оверлэй', () => {
      cy.get(dataCyBunFirst).click();
      cy.get(`${modals}>div:nth-of-type(2)`).click({ force: true });
      cy.wait(1000);
      cy.get(modals).children().should('have.length', 0);
    });
  });

  describe('Оформление заказа', () => {
    beforeEach(() => {
      cy.setCookie('accessToken', 'EXAMPLE_ACCESS_TOKEN');
      localStorage.setItem('refreshToken', 'EXAMPLE_REFRESH_TOKEN');
      cy.intercept('GET', 'api/auth/user', { fixture: 'user' });
      cy.intercept('POST', 'api/orders', { fixture: 'order' });
      cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients' });
      cy.visit(baseUrl);
    });

    it('Оформление', () => {
      cy.get(dataCyOrder).should('be.disabled');

      cy.get(`${dataCyBunFirst} button`).click();
      cy.get(dataCyOrder).should('be.disabled');

      cy.get('[data-cy="main"]:first-of-type button').click();
      cy.get(dataCyOrder).should('be.enabled');

      cy.get(dataCyOrder).click();

      cy.get(modals).children().should('have.length', 2);
      cy.get(`${modals} h2:first-of-type`).should('have.text', orderFixture.order.number);

      cy.get(dataCyOrder).should('be.disabled');

      cy.get(dataCyConstructor).children().should('have.length', 1);
    });

    afterEach(() => {
      cy.clearCookies();
      cy.clearLocalStorage();
    });
  });

  describe('Тест добавления ингредиента в конструктор', () => {
    it('Корректное добавление ингредиента', () => {
      cy.get('[data-cy="main"]:first-of-type')
        .find('p.text_type_main-default')
        .invoke('text')
        .then((ingredientName) => {
          const name = ingredientName.trim();

          cy.get('[data-cy="main"]:first-of-type')
            .find('button.common_button')
            .click();

          cy.get('.HEJ0tV35JHL7iuHL89vk')
            .find('span.constructor-element__text')
            .contains(name)
            .should('exist');
        });
    });
  });

  afterEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });
});
