import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('dashboard', 'routes/dashboard.tsx'),
  route('cosmic-view', 'routes/cosmic-view.tsx'),
  route('earth-weather', 'routes/earth-weather.tsx'),
] satisfies RouteConfig;
