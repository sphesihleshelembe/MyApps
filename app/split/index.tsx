import React, { useState } from "react";
import * as DocumentPicker from "expo-document-picker";

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { FileText, Plus } from "lucide-react-native";

import NoviqPdf from "../../modules/noviq-vision/src/NoviqPdf";

import { savePdf } from "@/services/export/savePdf";
import { useTheme } from "@/hooks/useTheme";
import {
  Shadows,
} from "@/theme";
import * as FileSystem from "expo-file-system/legacy";


export default function SplitScreen() {

  const { colors } = useTheme();

  const [pdf, setPdf] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [splitting, setSplitting] =
    useState(false);


  const pickPDF = async () => {

    const result =
      await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });


    if (!result.canceled) {

      setPdf(result.assets[0]);

    }

  };


  const splitPDF = async () => {
  if (!pdf) return;

  setSplitting(true);

  try {
    const path = pdf.uri.replace("file://", "");

    const result = await NoviqPdf.split(path);

    console.log("SPLIT RESULT:", result);

    if (result.success && result.files) {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert("Cancelled", "No folder selected.");
        return;
      }

      for (let i = 0; i < result.files.length; i++) {
        await savePdf(
          permissions.directoryUri,
          result.files[i],
          `Split_Page_${i + 1}.pdf`
        );
      }

      Alert.alert(
        "Success",
        `${result.files.length} PDFs saved successfully.`
      );
    } else {
      Alert.alert(
        "Error",
        result.error ?? "Split failed"
      );
    }

  } catch (error) {
    console.error(error);

    Alert.alert(
      "Error",
      "Something went wrong while splitting."
    );
  } finally {
    setSplitting(false);
  }
};



return (

<SafeAreaView
style={[
styles.container,
{
backgroundColor: colors.background
}
]}
>


<View style={styles.header}>

<Text
style={[
styles.title,
{
color: colors.text
}
]}
>
Split PDF
</Text>


<Text
style={[
styles.subtitle,
{
color: colors.textSecondary
}
]}
>
Separate a PDF into individual pages.
</Text>

</View>



<TouchableOpacity
style={[
styles.button,
{
backgroundColor: colors.primary
},
Shadows.md
]}
onPress={pickPDF}
>


<Plus
size={20}
color="#fff"
/>


<Text style={styles.buttonText}>
Select PDF
</Text>


</TouchableOpacity>




{
pdf ? (

<View
style={[
styles.pdfCard,
{
borderColor: colors.border
},
Shadows.sm
]}
>


<View
style={[
styles.iconContainer,
{
backgroundColor: colors.primaryLight
}
]}
>

<FileText
size={22}
color={colors.primary}
/>

</View>


<View style={{flex:1}}>

<Text
style={[
styles.pdfName,
{
color: colors.text
}
]}
numberOfLines={1}
>

{pdf.name}

</Text>


<Text
style={[
styles.pdfSize,
{
color: colors.textSecondary
}
]}
>

{(pdf.size! / 1024 / 1024).toFixed(2)} MB

</Text>


</View>


</View>


) : (

<View
style={[
styles.emptyState,
{
backgroundColor: colors.card,
borderColor: colors.border
}
]}
>

<FileText
size={44}
color={colors.textSecondary}
/>


<Text
style={[
styles.emptyTitle,
{
color: colors.text
}
]}
>

No PDF selected

</Text>


</View>

)

}




<TouchableOpacity

style={[
styles.button,
{
backgroundColor: colors.primary,
opacity:
!pdf || splitting ? 0.5 : 1
},
Shadows.md
]}

disabled={!pdf || splitting}

onPress={splitPDF}

>


{
splitting ?

<ActivityIndicator
color="#fff"
/>

:

<Text style={styles.buttonText}>
Split PDF
</Text>

}


</TouchableOpacity>


</SafeAreaView>

);

}



const styles = StyleSheet.create({

container:{
flex:1,
padding:20,
},


header:{
marginBottom:28,
},


title:{
fontSize:30,
fontWeight:"700",
marginBottom:6,
},


subtitle:{
fontSize:15,
lineHeight:22,
},


button:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
gap:8,
paddingVertical:16,
borderRadius:16,
marginBottom:20,
},


buttonText:{
color:"#fff",
fontSize:16,
fontWeight:"600",
},


pdfCard:{
flexDirection:"row",
alignItems:"center",
borderWidth:1,
borderRadius:16,
padding:16,
marginBottom:20,
},


iconContainer:{
width:48,
height:48,
borderRadius:12,
justifyContent:"center",
alignItems:"center",
marginRight:14,
},


pdfName:{
fontSize:16,
fontWeight:"600",
},


pdfSize:{
fontSize:13,
marginTop:4,
},


emptyState:{
borderWidth:1,
borderRadius:18,
paddingVertical:40,
alignItems:"center",
justifyContent:"center",
},


emptyTitle:{
fontSize:18,
fontWeight:"600",
marginTop:16,
},


});