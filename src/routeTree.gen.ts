// @ts-nocheck
/* eslint-disable */

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as ProduitsImport } from './routes/produits'
import { Route as PanierImport } from './routes/panier'
import { Route as AuthImport } from './routes/auth'
import { Route as CompteImport } from './routes/compte'
import { Route as AdminImport } from './routes/admin'
import { Route as CgvImport } from './routes/cgv'
import { Route as MentionsImport } from './routes/mentions'
import { Route as ConfidentialiteImport } from './routes/confidentialite'
import { Route as AffiliationImport } from './routes/affiliation'
import { Route as ProductSlugImport } from './routes/product.$slug'
import { Route as CategorySlugImport } from './routes/category.$slug'
import { Route as PageSlugImport } from './routes/page.$slug'

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ProduitsRoute = ProduitsImport.update({
  id: '/produits',
  path: '/produits',
  getParentRoute: () => rootRoute,
} as any)

const PanierRoute = PanierImport.update({
  id: '/panier',
  path: '/panier',
  getParentRoute: () => rootRoute,
} as any)

const AuthRoute = AuthImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRoute,
} as any)

const CompteRoute = CompteImport.update({
  id: '/compte',
  path: '/compte',
  getParentRoute: () => rootRoute,
} as any)

const AdminRoute = AdminImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const CgvRoute = CgvImport.update({
  id: '/cgv',
  path: '/cgv',
  getParentRoute: () => rootRoute,
} as any)

const MentionsRoute = MentionsImport.update({
  id: '/mentions',
  path: '/mentions',
  getParentRoute: () => rootRoute,
} as any)

const ConfidentialiteRoute = ConfidentialiteImport.update({
  id: '/confidentialite',
  path: '/confidentialite',
  getParentRoute: () => rootRoute,
} as any)

const AffiliationRoute = AffiliationImport.update({
  id: '/affiliation',
  path: '/affiliation',
  getParentRoute: () => rootRoute,
} as any)

const ProductSlugRoute = ProductSlugImport.update({
  id: '/product/$slug',
  path: '/product/$slug',
  getParentRoute: () => rootRoute,
} as any)

const CategorySlugRoute = CategorySlugImport.update({
  id: '/category/$slug',
  path: '/category/$slug',
  getParentRoute: () => rootRoute,
} as any)

const PageSlugRoute = PageSlugImport.update({
  id: '/page/$slug',
  path: '/page/$slug',
  getParentRoute: () => rootRoute,
} as any)

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/produits': {
      id: '/produits'
      path: '/produits'
      fullPath: '/produits'
      preLoaderRoute: typeof ProduitsImport
      parentRoute: typeof rootRoute
    }
    '/panier': {
      id: '/panier'
      path: '/panier'
      fullPath: '/panier'
      preLoaderRoute: typeof PanierImport
      parentRoute: typeof rootRoute
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthImport
      parentRoute: typeof rootRoute
    }
    '/compte': {
      id: '/compte'
      path: '/compte'
      fullPath: '/compte'
      preLoaderRoute: typeof CompteImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/cgv': {
      id: '/cgv'
      path: '/cgv'
      fullPath: '/cgv'
      preLoaderRoute: typeof CgvImport
      parentRoute: typeof rootRoute
    }
    '/mentions': {
      id: '/mentions'
      path: '/mentions'
      fullPath: '/mentions'
      preLoaderRoute: typeof MentionsImport
      parentRoute: typeof rootRoute
    }
    '/confidentialite': {
      id: '/confidentialite'
      path: '/confidentialite'
      fullPath: '/confidentialite'
      preLoaderRoute: typeof ConfidentialiteImport
      parentRoute: typeof rootRoute
    }
    '/affiliation': {
      id: '/affiliation'
      path: '/affiliation'
      fullPath: '/affiliation'
      preLoaderRoute: typeof AffiliationImport
      parentRoute: typeof rootRoute
    }
    '/product/$slug': {
      id: '/product/$slug'
      path: '/product/$slug'
      fullPath: '/product/$slug'
      preLoaderRoute: typeof ProductSlugImport
      parentRoute: typeof rootRoute
    }
    '/category/$slug': {
      id: '/category/$slug'
      path: '/category/$slug'
      fullPath: '/category/$slug'
      preLoaderRoute: typeof CategorySlugImport
      parentRoute: typeof rootRoute
    }
    '/page/$slug': {
      id: '/page/$slug'
      path: '/page/$slug'
      fullPath: '/page/$slug'
      preLoaderRoute: typeof PageSlugImport
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute._addFileChildren([
  IndexRoute,
  ProduitsRoute,
  PanierRoute,
  AuthRoute,
  CompteRoute,
  AdminRoute,
  CgvRoute,
  MentionsRoute,
  ConfidentialiteRoute,
  AffiliationRoute,
  ProductSlugRoute,
  CategorySlugRoute,
  PageSlugRoute,
])
