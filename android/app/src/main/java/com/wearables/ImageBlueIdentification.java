package com.wearables;


import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.opencv.android.Utils;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.imgproc.Imgproc;

import java.io.File;
import java.io.FileInputStream;

public class ImageBlueIdentification extends ReactContextBaseJavaModule {
    //constructor
    public ImageBlueIdentification(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "ImageBlueIdentification";
    }

    //Custom function that we are going to export to JS
    @ReactMethod
    public void checkIsImageBlur(String imageAsBase64, Callback cb) {
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inDither = true;
            options.inPreferredConfig = Bitmap.Config.ARGB_8888;

            byte[] decodedString = Base64.decode(imageAsBase64, Base64.DEFAULT);
            Bitmap image = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

            int l = CvType.CV_8UC1; //8-bit grey scale image
            Mat matImage = new Mat();
            Utils.bitmapToMat(image, matImage);
            Mat matImageGrey = new Mat();
            Imgproc.cvtColor(matImage, matImageGrey, Imgproc.COLOR_BGR2GRAY);

            Bitmap destImage;
            destImage = Bitmap.createBitmap(image);
            Mat dst2 = new Mat();
            Utils.bitmapToMat(destImage, dst2);
            Mat laplacianImage = new Mat();
            dst2.convertTo(laplacianImage, l);
            Imgproc.Laplacian(matImageGrey, laplacianImage, CvType.CV_8U);
            Mat laplacianImage8bit = new Mat();
            laplacianImage.convertTo(laplacianImage8bit, l);

            Bitmap bmp = Bitmap.createBitmap(laplacianImage8bit.cols(), laplacianImage8bit.rows(), Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(laplacianImage8bit, bmp);
            int[] pixels = new int[bmp.getHeight() * bmp.getWidth()];
            bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight());
            int maxLap = -16777216; // 16m
            for (int pixel : pixels) {
                if (pixel > maxLap)
                    maxLap = pixel;
            }

            int soglia = -6118750;
            // int soglia = -8118750;

            Log.v("Image Blur Checking-->","maxLap--->"+maxLap);
            Log.v("Image Blur Checking-->","soglia--->"+soglia);

            if (maxLap <= soglia) {
                cb.invoke(true);
                System.out.println("is blur image");
            }else{
                cb.invoke(false);
            }
        } catch (Exception e) {
            cb.invoke(false,null);
            e.printStackTrace();
        }


//        BitmapFactory.Options options = new BitmapFactory.Options();
//        options.inDither = true;
//        options.inPreferredConfig = Bitmap.Config.ARGB_8888;
//        Bitmap image = decodeSampledBitmapFromFile(pass.replace("file:///","/"), options, 1000);
//        Log.v("ImageBlueIdentification","bitmapimage--->"+image);
//        int l = CvType.CV_8UC1; //8-bit grey scale image
//        Mat matImage = new Mat();
//        Utils.bitmapToMat(image, matImage);
//        Mat matImageGrey = new Mat();
//        Imgproc.cvtColor(matImage, matImageGrey, Imgproc.COLOR_BGR2GRAY);
//
//        Bitmap destImage;
//        destImage = Bitmap.createBitmap(image);
//        Mat dst2 = new Mat();
//        Utils.bitmapToMat(destImage, dst2);
//        Mat laplacianImage = new Mat();
//        dst2.convertTo(laplacianImage, l);
//        Imgproc.Laplacian(matImageGrey, laplacianImage, CvType.CV_8U);
//        Mat laplacianImage8bit = new Mat();
//        laplacianImage.convertTo(laplacianImage8bit, l);
//
//        Bitmap bmp = Bitmap.createBitmap(laplacianImage8bit.cols(), laplacianImage8bit.rows(), Bitmap.Config.ARGB_8888);
//        Utils.matToBitmap(laplacianImage8bit, bmp);
//        int[] pixels = new int[bmp.getHeight() * bmp.getWidth()];
//        bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(), bmp.getHeight()); // bmp为轮廓图
//
//        int maxLap = -16777216; // 16m
//        for (int pixel : pixels) {
//            if (pixel > maxLap)
//                maxLap = pixel;
//        }
//
//        int soglia = -6118750;
//        if (maxLap <= soglia) {
//            System.out.println("is blur image");
//        }
//        soglia += 6118750;
//        maxLap += 6118750;
////        Log.v("","图片位置=" + pass
////                + "\nimage.w=" + image.getWidth() + ", image.h=" + image.getHeight()
////                + "\nmaxLap= " + maxLap + "(清晰范围:0~6118750)"
////                + "\n" + Html.fromHtml("<font color='#eb5151'><b>" + (maxLap <= soglia ? "模糊" : "清晰") + "</b></font>"));
//        //opencvEnd = true;
//       boolean isBlur = maxLap <= soglia;
//        Log.v("TAG","prblm soglia-->"+soglia);
//        Log.v("TAG","prblm maxLap-->"+maxLap);
//       Log.v("TAG","prblm isBlur-->"+isBlur);

//            Log.v("ImageBlueIdentification","image-->"+image);
//            if (image != null) {
//                BitmapFactory.Options opt = new BitmapFactory.Options();
//                opt.inDither = true;
//                opt.inPreferredConfig = Bitmap.Config.ARGB_8888;
//                int l = CvType.CV_8UC1;
//                Mat matImage = new Mat();
//                Utils.bitmapToMat(image, matImage);
//                Mat matImageGrey = new Mat();
//                Imgproc.cvtColor(matImage, matImageGrey, Imgproc.COLOR_BGR2GRAY);
//
//                Mat dst2 = new Mat();
//                Utils.bitmapToMat(image, dst2);
//
//                Mat laplacianImage = new Mat();
//                dst2.convertTo(laplacianImage, l);
//                Imgproc.Laplacian(matImageGrey, laplacianImage, CvType.CV_8U);
//                Mat laplacianImage8bit = new Mat();
//                laplacianImage.convertTo(laplacianImage8bit, l);
//                System.gc();
//
//                Bitmap bmp = Bitmap.createBitmap(laplacianImage8bit.cols(),
//                        laplacianImage8bit.rows(), Bitmap.Config.ARGB_8888);
//
//                Utils.matToBitmap(laplacianImage8bit, bmp);
//
//                int[] pixels = new int[bmp.getHeight() * bmp.getWidth()];
//                bmp.getPixels(pixels, 0, bmp.getWidth(), 0, 0, bmp.getWidth(),
//                        bmp.getHeight());
//                if (bmp != null)
//                    if (!bmp.isRecycled()) {
//                        bmp.recycle();
//
//                    }
//                int maxLap = -16777216;
//
//                for (int i = 0; i < pixels.length; i++) {
//
//                    if (pixels[i] > maxLap) {
//                        maxLap = pixels[i];
//                    }
//                }
//                int soglia = -6118750;
//                Log.v("ImageBlueIdentification","image result soglia-->"+soglia);
//                if (maxLap < soglia || maxLap == soglia) {
//                    Log.v("ImageBlueIdentification","image result1-->"+true);
//                    //return true;
//                } else {
//                    Log.v("ImageBlueIdentification","image result2-->"+false);
//                    //return false;
//                }
//            } else {
               // Log.v("ImageBlueIdentification","image result3-->"+false);
                //return false;
//            }
//        } catch (NullPointerException e) {
//            //return false;
//            Log.v("ImageBlueIdentification","image result4-->"+false);
//        } catch (OutOfMemoryError e) {
//            //return false;
//            Log.v("ImageBlueIdentification","image result5-->"+false);
//        }
//        try{
//            cb.invoke(true);
//        }catch (Exception e){
//            cb.invoke(false, null);
//        }
    }


    public Bitmap decodeSampledBitmapFromFile(String path, BitmapFactory.Options o,int reqSize) {
        try {
            // Decode image size
//            BitmapFactory.Options o = new BitmapFactory.Options();
//            o.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(path, o);
            // The new size we want to scale to
            final int REQUIRED_SIZE = reqSize;

            // Find the correct scale value. It should be the power of 2.
            int scale = 1;
            while (o.outWidth / scale / 2 >= REQUIRED_SIZE && o.outHeight / scale / 2 >= REQUIRED_SIZE)
                scale *= 2;

            // Decode with inSampleSize
            BitmapFactory.Options o2 = new BitmapFactory.Options();
            o2.inSampleSize = scale;
            return BitmapFactory.decodeFile(path, o2);
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;

    }

    public Bitmap getBitmap(String path) {
        Bitmap bitmap=null;
        try {
            File f= new File(path);
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inDither = true;
            options.inPreferredConfig = Bitmap.Config.ARGB_8888;
            bitmap = BitmapFactory.decodeStream(new FileInputStream(f), null, options);
            //image.setImageBitmap(bitmap);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return bitmap ;
    }

}