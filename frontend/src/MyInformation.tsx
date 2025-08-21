function MyInformation({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email?: string;
}) {
  return (
    <div className="my-info">
      <p>Id : {id}</p>
      <p>Name : {name}</p>
      {email ? <p>Email : {email}</p> : <p>No Email Found</p>}
    </div>
  );
}

export default MyInformation;
