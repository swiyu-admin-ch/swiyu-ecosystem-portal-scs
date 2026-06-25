import {routes} from './app.routes';

describe('App Routes', () => {
  it('should have default wildcard redirect route to organisations', () => {
    const route = routes.at(routes.length - 1);
    expect(route?.path).toBe('**');
    expect(route?.redirectTo).toBe('organizations');
    expect(route?.pathMatch).toBe('full');
  });
});
