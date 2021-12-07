// Amazon Cognito 인증 공급자를 초기화합니다
AWS.config.region = 'ap-northeast-2'; // 리전
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-northeast-2:bbf72c4d-da99-4cdf-8d90-b22a87ad6581',
});

var albumBucketName = "fixframeimages";
var bucketRegion = "ap-northeast-2";
var IdentityPoolId = "ap-northeast-2:bbf72c4d-da99-4cdf-8d90-b22a87ad6581";


AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
    })
  });
   
  var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: albumBucketName }
  });
   
  //db에 정보 올리는 함수
  function upload_to_db(img_location) {
      var article_id = document.querySelector("#id").value;
      var article_title = document.querySelector("#title").value;
      var article_content = document.querySelector("#content").value;
   
      var Item = {
          'article_id': article_id,
          'title': article_title,
          'content': article_content,
          'img_source': img_location,
      }
      console.log(Item);
   
      const URL = "https://iubccppr7d.execute-api.ap-northeast-2.amazonaws.com/simple_board/article-resource";
   
      fetch(URL, {
          method: "POST",
          headers: {
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              "TableName": "simple_board",
              Item
          })
      }).then(resp => console.log(resp))
          .catch(err => console.log(err))
  }

     
  function add_article_with_photo(albumName) {
      var files = document.getElementById("article_image").files;
      if (!files.length) {
          return alert("Please choose a file to upload first.");
      }
      var file = files[0];
      var fileName = file.name;
      var albumPhotosKey = encodeURIComponent(albumName) + "/";
      var albumPhotosKey = albumName + "/";
   
      var photoKey = albumPhotosKey + fileName;
   
      // Use S3 ManagedUpload class as it supports multipart uploads
      var upload = new AWS.S3.ManagedUpload({
         params: {
         Bucket: albumBucketName,
          Key: photoKey,
          Body: file
          }
      });
   
      var promise = upload.promise();
   
      let img_location;
   
      promise.then(
          function(data) {
          //이미지 파일을 올리고 URL을 받아옴
          img_location = JSON.stringify(data.Location).replaceAll("\"","");
          // console.log(img_location);
          
          upload_to_db(img_location);
   
          return alert("Successfully uploaded photo.");;
          },
          function(err) {
              console.log(err);
          return alert("There was an error uploading your photo: ", err.message);
          }
      );
      }
  