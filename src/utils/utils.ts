import { uuid } from "vue-uuid";

export function diaplayTime(data: string | number) {
    let result = "";
    const str = data;
    //将字符串转换成时间格式
    const timePublish = new Date(str);
    const timeNow = new Date();
    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;
    const diffValue = timeNow.valueOf() - timePublish.valueOf();
    const diffMonth = diffValue / month;
    const diffWeek = diffValue / (7 * day);
    const diffDay = diffValue / day;
    const diffHour = diffValue / hour;
    const diffMinute = diffValue / minute;
    const diffYear = diffValue / year;
    if (diffValue < 0) {
        result = "刚刚";
    } else if (diffYear > 1) {
        result = Math.ceil(diffYear) + "年前";
    } else if (diffMonth > 1) {
        result = Math.ceil(diffMonth) + "月前";
    } else if (diffWeek > 1) {
        result = Math.ceil(diffWeek) + "周前";
    } else if (diffDay > 1) {
        result = Math.ceil(diffDay) + "天前";
    } else if (diffHour > 1) {
        result = Math.ceil(diffHour) + "小时前";
    } else if (diffMinute > 1) {
        result = Math.ceil(diffMinute) + "分钟前";
    } else {
        result = "刚刚";
    }
    return result;
}
// 格式化大小
export function getFileSize(size: number): string {
    let fileSize = size * 1.0;
    let s = fileSize;
    let unit: string;
    if (fileSize != 0) {
        var l: number;
        if (fileSize < 1024) {
            l = 0;
        } else if (fileSize < 1024 * 1024) {
            l = 1;
            s = fileSize / 1024;
        } else {
            for (l = 2; fileSize >= 1024 * 1024; l++) {
                fileSize = fileSize / 1024;
                if ((fileSize / 1024) < 1024) {
                    s = fileSize / 1024;
                    break;
                }
            }
        }

        switch (l) {
            case 0:
                unit = "Byte";
                break;
            case 1:
                unit = "KB";
                break;
            case 2:
                unit = "MB";
                break;
            case 3:
                unit = "GB";
                break;
            case 4:
                //不可能也不该达到的值
                unit = "TB";
                break;
            default:
                //ER代表错误
                unit = "ER";
        }
        var format = s.toFixed(2);
        return format + unit;
    }
    return "";
}
// file为视频的文件对象，可使用 input[file] 进行获取
export function loadVideo(file: File): Promise<HTMLVideoElement> {
    return new Promise(function (resolve, reject) {
        const videoElem = document.createElement('video')
        const dataUrl = URL.createObjectURL(file)
        // 当前帧的数据是可用的
        videoElem.onloadeddata = function () {
            resolve(videoElem)
        }
        videoElem.onerror = function () {
            reject('video 后台加载失败')
        }
        // 设置 auto 预加载数据， 否则会出现截图为黑色图片的情况
        videoElem.setAttribute('preload', 'auto')
        videoElem.src = dataUrl
    })
}
// 压缩图片
export function imageCompress(image: HTMLImageElement, width: number, quality: number): Promise<{ file: File, width: number, height: number }> {
    return new Promise((ok, err) => {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = Math.min(image.naturalWidth, width)
            var h = w * image.naturalHeight / image.naturalWidth;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(function (blob) {
                const thumbFile = new File([blob], uuid.v4()+'.jpeg')
                ok({ file: thumbFile, width: w, height: h })
            }, 'image/jpeg', quality);
        } catch (e) {
            err(e)
        }

    })

}