import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { AiOutlineStar } from "react-icons/ai";
import styled from "styled-components";

const StarIcons = ({ stars = 0, reviews = 0, size = "1.2rem" }) => {
  const fullStars = Math.floor(stars); // 3.2 → 3
  const hasHalfStar = stars - fullStars > 0; 

  const ratingStar = Array.from({ length: 5 }, (_, index) => {
    if (index < fullStars) {
      return <FaStar key={index} className="icon" style={{ fontSize: size }} />;
    } else if (index === fullStars && hasHalfStar) {
      return <FaStarHalfAlt key={index} className="icon" style={{ fontSize: size }} />;
    } else {
      return <AiOutlineStar key={index} className="icon empty-icon" style={{ fontSize: size }} />;
    }
  });

  return (
    <Wrapper>
      <div className="icon-style">
        {ratingStar}
        <p>({reviews})</p>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .icon-style {
    display: flex;
    align-items: center;
    gap: 0.3rem;

    .icon {
      color: orange;
    }

    .empty-icon {
      color: #ccc;
    }

    p {
      margin: 0;
      padding-left: 0.8rem;
      font-size: 0.9rem;
      color: #555;
    }
  }
`;

export default StarIcons;