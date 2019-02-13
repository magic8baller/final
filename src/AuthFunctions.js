const hashParams = new URLSearchParams(window.location.hash.substring(1))
export const getAccessToken = () => hashParams.get('access_token')
export const getRefreshToken = () => hashParams.get('refresh_token')
export const isAuthenticated = () => !!getAccessToken()

export const redirectToLogin = () => {
  history.push('/login')
}

export const AuthenticatedRoute = ({
  component: Component,
  exact,
  path
}) => {
  <Route
    exact={exact}
    path={path}
    render={props => isAuthenticated() ? (
      <Component {...props} />
    ) : (
      <AuthenticateBeforeRender render={() => <Component {...props}/>} />
    )
    }
}