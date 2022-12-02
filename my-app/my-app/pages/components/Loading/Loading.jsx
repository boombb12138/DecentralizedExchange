import React, { memo } from "react";
import { LoadingWrapper } from "./style";
const Loading = memo(() => {
  return (
    <LoadingWrapper>
      <div class="body">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div class="base">
          <span></span>
          <div class="face"></div>
        </div>
      </div>
      <h1>Loading</h1>
    </LoadingWrapper>
  );
});

export default Loading;
