import {routes} from './app.routes';

describe('App Routes', () => {
  it('should have default wildcard redirect route to business-partners', () => {
    const route = routes.at(routes.length - 1);
    expect(route?.path).toBe('**');
    expect(route?.redirectTo).toBe('business-partners');
    expect(route?.pathMatch).toBe('full');
  });
});
