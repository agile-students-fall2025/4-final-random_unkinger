import './App.css';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Profile from "./Components/Profile/Profile";
import Search from "./Components/Search/Search";
import ActivityTracking from "./Components/ActivityTracking/ActivityTracking";
import AddMeal from './Components/ScanFood/AddMeal';
import ScanMeal from './Components/ScanFood/ScanMeal'

function App() {
  return (
    <div>

      {/* Uncomment the page you want to see: */}
      <LoginSignup/>
      {/* <Profile /> */}
      {/* <Search /> */}
      {/* <ActivityTracking /> */}
      {/* <AddMeal/> */}
      {/* <ScanMeal/> */}

    </div>
  );
}

export default App;
