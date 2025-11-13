import "../pages/DevUserProfile.css";

type LoadDevUserProps = {
  event: boolean;
};

const LoadDevUser: React.FC<LoadDevUserProps> = ({ event }) => {
  if (!event) return null;

  return (
    <div className="devProfileContainer">
      <span className="dev-title">Your Games in Development</span>
      <div className="dev-games">
        {/* Display development games here */}
      </div>
    </div>
  );
};

export default LoadDevUser;