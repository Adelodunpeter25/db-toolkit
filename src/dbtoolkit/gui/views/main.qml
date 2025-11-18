import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Controls.Material 2.15
import QtQuick.Layouts 1.15

ApplicationWindow {
    id: window
    width: 1200
    height: 800
    visible: true
    title: "DB Toolkit"
    
    Material.theme: Material.Light
    Material.primary: Material.Blue
    
    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        
        Text {
            text: "DB Toolkit"
            font.pixelSize: 32
            font.bold: true
            Layout.alignment: Qt.AlignHCenter
        }
        
        Text {
            text: "Database Management Application"
            font.pixelSize: 16
            color: Material.color(Material.Grey)
            Layout.alignment: Qt.AlignHCenter
        }
        
        Item {
            Layout.fillHeight: true
        }
        
        Button {
            text: "Connect to Database"
            Layout.alignment: Qt.AlignHCenter
            Material.background: Material.Blue
            onClicked: {
                console.log("Connect button clicked")
            }
        }
        
        Item {
            Layout.fillHeight: true
        }
    }
}