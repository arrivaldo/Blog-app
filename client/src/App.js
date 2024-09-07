import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { UserContextProvider } from "./UserContext";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import EditPost from "./pages/EditPost";

const App = () => {
  return (
<>

{/* <div class="container-bg">
  <div class="gradient-bg"></div>
</div> */}
{/* <div class="background-div"></div> */}

{/* <div class="container-bg">
  <div class="gradient-bg"></div>
</div> */}

<div className="container-bg">
  <div className="grid-bg"></div>
</div>



<UserContextProvider>
<Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/edit/:id" element={<EditPost />}/>
      </Route>
    </Routes>

</UserContextProvider>
</>

  );
};

export default App;

//  <main className="">
//  <Header />
//  <Post />
//  <Post />
//  <Post />
//  </main>
