import { useCallback, useState } from 'react';
import { Heading, VStack, SectionList, Text, useToast, Center } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';

import { api } from '@services/api';
import { useAuth } from '@hooks/useAuth';

import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';

import { AppError } from '@utils/AppError';

import { ScreenHeader } from '@components/ScreenHeader';
import { HistoryCard } from '@components/HistoryCard';
import { Loading } from '@components/Loading';

export function History() {
    const { refreshedToken } = useAuth();
    const toast = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    async function fetchHistory() {
        try {
            setIsLoading(true);
            
            const response = await api.get('/history');

            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;

            const title = isAppError ? error.message : 'Não foi possível carregar o histórico.';

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            });
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        fetchHistory();
    }, [refreshedToken]));

    return ( 
        <VStack flex={1}>
            <ScreenHeader title='Histórico de Exercícios' />

            {
                isLoading ? <Loading /> : (exercises?.length > 0 ?
                    <SectionList 
                        sections={exercises}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <HistoryCard data={item} />}
                        renderSectionHeader={({ section }) => (
                            <Heading color='gray.200' fontSize='md' fontFamily='heading' mt={10} mb={3}>
                                {section.title}
                            </Heading>
                        )}
                        px={8}
                        showsVerticalScrollIndicator={false}
                    />
                    :
                    <Center flex={1}>
                        <Text color='gray.100' textAlign='center'>
                            Não há exercícios registrados ainda. {'\n'}
                            Vamos fazer exercícios hoje?
                        </Text>
                    </Center>
                ) 
            }
        </VStack>
    );
};
