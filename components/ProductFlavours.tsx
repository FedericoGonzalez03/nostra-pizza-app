import { useContext, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ErrorContext } from "@/app/_layout";
import { CheckWithLabel } from "./CheckWithLabel";
import { useMQ, useRS } from "react-native-full-responsive";

declare type TFlavour = {
    id: number;
    name: string;
    available: boolean;
    checked?: boolean;
}

declare type TFlavourGroup = {
    name: string;
    flavours: TFlavour[];
    quantity: number;
}

declare type TFlavoursResponse = {
    quantity: number;
    grp_title: string;
    flv_id: number;
    name: string;
    available: boolean;
}

export default function ProductFlavours({ prodId, visible }: { prodId: number, visible: boolean }) {

    const [flavours, setFlavours] = useState<TFlavourGroup[]>([]);

    const { showErrorModal } = useContext(ErrorContext);

    useEffect(() => {
        if (!prodId) return;
        fetch(`http://192.168.147.106:3000/flavours/${prodId}`)
            .then(res => res.status == 200 ? res.json() : res.text())
            .then((data: string | TFlavoursResponse[]) => {
                if (typeof data === 'string') {
                    showErrorModal(data);
                } else {
                    const flavours: TFlavourGroup[] = [];
                    data.forEach(flavour => {
                        const group = flavours.find(g => g.name === flavour.grp_title);
                        if (group) {
                            group.flavours.push({
                                id: flavour.flv_id,
                                name: flavour.name,
                                available: flavour.available
                            });
                        } else {
                            flavours.push({
                                name: flavour.grp_title,
                                quantity: flavour.quantity,
                                flavours: [{
                                    id: flavour.flv_id,
                                    name: flavour.name,
                                    available: flavour.available
                                }]
                            });
                        }
                    });
                    setFlavours(flavours);
                }
            })
    }, [prodId]);

    const handleFlavourChange = (flavourId: number) => {
        setFlavours(state => 
            state.map(group => {
                const totalChecked = group.flavours.filter(flavour => flavour.checked).length;
                return {
                    ...group,
                    flavours: group.flavours.map(flavour => {
                        if (flavour.id === flavourId) {
                            if (flavour.checked || totalChecked < group.quantity) {
                                return { ...flavour, checked: !flavour.checked };
                            }
                        }
                        return flavour;
                    })
                };
            })
        );
    }

    const mq = useMQ();
    const rs = useRS(1);

    return (
        <View style={visible && flavours.length > 0 ? { display: 'flex', paddingTop: 5, width: '50%' } : { display: "none", paddingTop: 0 }}>
            {flavours.map(group => {
                const totalChecked = group.flavours.filter(flavour => flavour.checked).length;
                return (
                    <View key={group.name}>
                        <Text style={{ color: '#F5F5DC', fontFamily: 'Coustard', fontSize: ['xs', 'sm'].includes(mq) ? 28 * rs : 18 * rs}}>{group.name} (máx {group.quantity}) :</Text>
                        {group.flavours.map(flavour => (
                            <View key={flavour.id} style={{ paddingTop: 5 }}>
                                <Pressable 
                                    onPress={() => handleFlavourChange(flavour.id)} 
                                    disabled={!flavour.available || !flavour.checked && totalChecked >= group.quantity}
                                >
                                    <CheckWithLabel label={flavour.name} checked={flavour.checked ?? false} size={['xs', 'sm'].includes(mq) ? 24 * rs : 15 * rs} disabled={!flavour.available || !flavour.checked && totalChecked >= group.quantity} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                );
            })}
        </View>
    );
}