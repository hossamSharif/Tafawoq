/**
 * Services Context
 *
 * Dependency injection for service layer
 * Per client-services.md contract specification
 *
 * This context provides all services to the application via React Context API.
 * Services are instantiated once and shared across the app.
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';

/**
 * Services interface
 *
 * Will be populated with actual service implementations in Phase 3-8:
 * - AuthService (US1)
 * - ProfileService (US1)
 * - SubscriptionService (US2)
 * - ExamService (US3)
 * - PracticeService (US4)
 * - AnalyticsService (US5)
 * - NotificationService (US6)
 */
export interface Services {
  // Phase 3 services (US1: Authentication & Profile)
  auth?: any; // AuthService
  profile?: any; // ProfileService

  // Phase 4 services (US2: Subscription)
  subscription?: any; // SubscriptionService

  // Phase 5 services (US3: Exam)
  exam?: any; // ExamService

  // Phase 6 services (US4: Practice)
  practice?: any; // PracticeService

  // Phase 7 services (US5: Analytics)
  analytics?: any; // AnalyticsService

  // Phase 8 services (US6: Notifications)
  notifications?: any; // NotificationService
}

/**
 * Services Context
 */
const ServicesContext = createContext<Services | undefined>(undefined);

/**
 * Services Provider Props
 */
interface ServicesProviderProps {
  children: ReactNode;
  services?: Services; // Optional services for testing
}

/**
 * Services Provider
 *
 * Usage in App.tsx:
 * ```typescript
 * import { ServicesProvider } from '@/contexts/ServicesContext';
 *
 * export default function App() {
 *   return (
 *     <ServicesProvider>
 *       <YourAppComponents />
 *     </ServicesProvider>
 *   );
 * }
 * ```
 */
export const ServicesProvider: React.FC<ServicesProviderProps> = ({
  children,
  services: injectedServices,
}) => {
  // Initialize services (lazy initialization)
  const services = useMemo<Services>(() => {
    // If services are injected (for testing), use them
    if (injectedServices) {
      return injectedServices;
    }

    // Initialize production services
    // Services will be instantiated in phases 3-8
    const productionServices: Services = {
      // Phase 3: AuthService and ProfileService will be added here
      // Example:
      // auth: new AuthService(supabase),
      // profile: new ProfileService(supabase),

      // Phase 4: SubscriptionService will be added here
      // Example:
      // subscription: new SubscriptionService(supabase),

      // Phase 5: ExamService will be added here
      // Example:
      // exam: new ExamService(supabase),

      // Phase 6: PracticeService will be added here
      // Example:
      // practice: new PracticeService(supabase),

      // Phase 7: AnalyticsService will be added here
      // Example:
      // analytics: new AnalyticsService(supabase),

      // Phase 8: NotificationService will be added here
      // Example:
      // notifications: new NotificationService(),
    };

    return productionServices;
  }, [injectedServices]);

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

/**
 * useServices Hook
 *
 * Access services from any component:
 *
 * ```typescript
 * import { useServices } from '@/contexts/ServicesContext';
 *
 * function MyComponent() {
 *   const { auth, profile } = useServices();
 *
 *   const handleLogin = async () => {
 *     const result = await auth.signIn(email, password);
 *     // ...
 *   };
 * }
 * ```
 */
export const useServices = (): Services => {
  const context = useContext(ServicesContext);

  if (context === undefined) {
    throw new Error(
      'useServices must be used within a ServicesProvider. ' +
      'Wrap your app with <ServicesProvider>...</ServicesProvider>'
    );
  }

  return context;
};

/**
 * useService Hook (type-safe single service access)
 *
 * Access a specific service with type safety:
 *
 * ```typescript
 * import { useService } from '@/contexts/ServicesContext';
 *
 * function MyComponent() {
 *   const authService = useService('auth');
 *
 *   const handleLogin = async () => {
 *     const result = await authService.signIn(email, password);
 *     // ...
 *   };
 * }
 * ```
 */
export const useService = <K extends keyof Services>(
  serviceName: K
): Services[K] => {
  const services = useServices();
  const service = services[serviceName];

  if (!service) {
    throw new Error(
      `Service "${String(serviceName)}" is not available. ` +
      `Make sure it's initialized in ServicesProvider.`
    );
  }

  return service;
};

/**
 * withServices HOC (for class components)
 *
 * ```typescript
 * import { withServices, Services } from '@/contexts/ServicesContext';
 *
 * interface Props {
 *   services: Services;
 * }
 *
 * class MyComponent extends React.Component<Props> {
 *   handleLogin = async () => {
 *     const { auth } = this.props.services;
 *     await auth.signIn(email, password);
 *   };
 * }
 *
 * export default withServices(MyComponent);
 * ```
 */
export const withServices = <P extends { services: Services }>(
  Component: React.ComponentType<P>
) => {
  return (props: Omit<P, 'services'>) => {
    const services = useServices();
    return <Component {...(props as P)} services={services} />;
  };
};
