import { useParams } from "react-router";

export const EditUser = () => {
  const params = useParams();
  if (!params) {
    return <p>User ID expected!</p>;
  }

  return (
    <>
      <h2>Edit User</h2>
      <p>{params["userId"]}</p>
    </>
  );
};
