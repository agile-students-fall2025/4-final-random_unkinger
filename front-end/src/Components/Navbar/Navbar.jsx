import React from 'react'

const Navbar = () => {
  return (
    <nav>
        <NavContainer>
            <NavLogo to = "/">
                <Logo />
                NutriLens
            </NavLogo>
        </NavContainer>
    </nav>
  )
}

export default Navbar